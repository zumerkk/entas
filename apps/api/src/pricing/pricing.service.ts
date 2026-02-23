import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { PriceList, PriceListDocument } from '../database/schemas/price-list.schema';
import {
    CustomerPriceOverride,
    CustomerPriceOverrideDocument,
} from '../database/schemas/customer-price-override.schema';
import { CustomerGroup, CustomerGroupDocument } from '../database/schemas/customer-group.schema';
import { Customer, CustomerDocument } from '../database/schemas/customer.schema';

/**
 * Fiyatlandırma Katmanları (öncelik sırası):
 *
 * 1. Müşteri Özel Fiyat (CustomerPriceOverride)
 * 2. Fiyat Listesi (PriceList — müşteri grubundan gelir)
 * 3. Quantity Break (ürün üzerindeki miktar kırılımları)
 * 4. Grup İskonto (CustomerGroup.discountPercent)
 * 5. Baz Fiyat (Product.basePrice)
 */
export interface PriceResult {
    productId: string;
    sku: string;
    basePrice: number;
    finalPrice: number;
    unitPrice: number;
    vatRate: number;
    vatAmount: number;
    totalWithVat: number;
    currency: string;
    appliedRule: string;
    breakdown: PriceBreakdown;
}

export interface PriceBreakdown {
    basePrice: number;
    customerOverride?: number;
    priceListPrice?: number;
    priceListName?: string;
    quantityBreakPrice?: number;
    quantityBreakMinQty?: number;
    groupDiscount?: number;
    groupDiscountPercent?: number;
    promotionDiscount?: number;
}

export interface PriceRequest {
    productId: string;
    quantity?: number;
    customerId?: string;
}

@Injectable()
export class PricingService {
    private readonly logger = new Logger(PricingService.name);

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(PriceList.name) private priceListModel: Model<PriceListDocument>,
        @InjectModel(CustomerPriceOverride.name) private overrideModel: Model<CustomerPriceOverrideDocument>,
        @InjectModel(CustomerGroup.name) private groupModel: Model<CustomerGroupDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    ) { }

    /**
     * Tek ürün için fiyat hesapla.
     */
    async calculatePrice(request: PriceRequest): Promise<PriceResult> {
        const { productId, quantity = 1, customerId } = request;

        const product = await this.productModel.findById(productId).lean();
        if (!product) {
            throw new Error(`Ürün bulunamadı: ${productId}`);
        }

        let finalPrice = product.basePrice;
        let appliedRule = 'base_price';
        const breakdown: PriceBreakdown = { basePrice: product.basePrice };

        // ─── 1. Müşteri Özel Fiyat ───
        if (customerId) {
            const override = await this.overrideModel.findOne({
                customerId: new Types.ObjectId(customerId),
                productId: new Types.ObjectId(productId),
                isActive: true,
                $or: [
                    { validFrom: null, validTo: null },
                    {
                        validFrom: { $lte: new Date() },
                        validTo: { $gte: new Date() },
                    },
                    { validFrom: { $lte: new Date() }, validTo: null },
                    { validFrom: null, validTo: { $gte: new Date() } },
                ],
            }).lean();

            if (override) {
                if (override.discountPercent) {
                    finalPrice = product.basePrice * (1 - override.discountPercent / 100);
                } else {
                    finalPrice = override.price;
                }
                appliedRule = 'customer_override';
                breakdown.customerOverride = finalPrice;
            }
        }

        // ─── 2. Fiyat Listesi (müşteri grubundan) ───
        if (customerId && appliedRule === 'base_price') {
            const customer = await this.customerModel.findById(customerId).lean();
            if (customer?.groupId) {
                const group = await this.groupModel.findById(customer.groupId).lean();

                if (group?.priceListId) {
                    const priceList = await this.priceListModel.findOne({
                        _id: group.priceListId,
                        isActive: true,
                        status: 'approved',
                        $or: [
                            { validFrom: null, validTo: null },
                            { validFrom: { $lte: new Date() }, validTo: { $gte: new Date() } },
                        ],
                    }).lean();

                    if (priceList) {
                        const item = priceList.items.find(
                            (i) => i.productId.toString() === productId,
                        );
                        if (item) {
                            finalPrice = item.price;
                            appliedRule = 'price_list';
                            breakdown.priceListPrice = item.price;
                            breakdown.priceListName = priceList.name;
                        }
                    }
                }

                // ─── 4. Grup İskonto ───
                if (group && appliedRule === 'base_price' && group.discountPercent > 0) {
                    const discount = finalPrice * (group.discountPercent / 100);
                    finalPrice = finalPrice - discount;
                    appliedRule = 'group_discount';
                    breakdown.groupDiscount = discount;
                    breakdown.groupDiscountPercent = group.discountPercent;
                }
            }
        }

        // ─── 3. Quantity Break ───
        if (product.quantityBreaks?.length > 0 && quantity > 1) {
            const sorted = [...product.quantityBreaks].sort((a, b) => b.minQty - a.minQty);
            const applicableBreak = sorted.find((qb) => quantity >= qb.minQty);
            if (applicableBreak && applicableBreak.price < finalPrice) {
                finalPrice = applicableBreak.price;
                appliedRule = 'quantity_break';
                breakdown.quantityBreakPrice = applicableBreak.price;
                breakdown.quantityBreakMinQty = applicableBreak.minQty;
            }
        }

        // ─── KDV Hesaplama ───
        const vatRate = product.vatRate || 20;
        const unitPrice = Math.round(finalPrice * 100) / 100;
        const vatAmount = Math.round(unitPrice * (vatRate / 100) * 100) / 100;
        const totalWithVat = Math.round((unitPrice + vatAmount) * 100) / 100;

        return {
            productId,
            sku: product.sku,
            basePrice: product.basePrice,
            finalPrice: unitPrice,
            unitPrice,
            vatRate,
            vatAmount,
            totalWithVat,
            currency: product.currency || 'TRY',
            appliedRule,
            breakdown,
        };
    }

    /**
     * Birden fazla ürün için toplu fiyat hesapla.
     */
    async calculateBulkPrices(
        items: { productId: string; quantity: number }[],
        customerId?: string,
    ): Promise<PriceResult[]> {
        const results = await Promise.all(
            items.map((item) =>
                this.calculatePrice({
                    productId: item.productId,
                    quantity: item.quantity,
                    customerId,
                }),
            ),
        );
        return results;
    }

    /**
     * Sepet toplam tutarını hesapla.
     */
    async calculateCartTotal(
        items: { productId: string; quantity: number }[],
        customerId?: string,
    ) {
        const prices = await this.calculateBulkPrices(items, customerId);

        let subtotal = 0;
        let vatTotal = 0;

        const lineItems = prices.map((price, idx) => {
            const qty = items[idx].quantity;
            const lineTotal = price.unitPrice * qty;
            const lineVat = price.vatAmount * qty;
            subtotal += lineTotal;
            vatTotal += lineVat;

            return {
                ...price,
                quantity: qty,
                lineTotal: Math.round(lineTotal * 100) / 100,
                lineVat: Math.round(lineVat * 100) / 100,
                lineTotalWithVat: Math.round((lineTotal + lineVat) * 100) / 100,
            };
        });

        return {
            items: lineItems,
            subtotal: Math.round(subtotal * 100) / 100,
            vatTotal: Math.round(vatTotal * 100) / 100,
            grandTotal: Math.round((subtotal + vatTotal) * 100) / 100,
            currency: 'TRY',
        };
    }
}
