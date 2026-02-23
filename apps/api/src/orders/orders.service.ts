import {
    Injectable, NotFoundException, BadRequestException,
    ConflictException, Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { OrderEvent, OrderEventDocument } from '../database/schemas/order-event.schema';
import { Inventory, InventoryDocument } from '../database/schemas/inventory.schema';
import { StockMovement, StockMovementDocument } from '../database/schemas/stock-movement.schema';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { PricingService } from '../pricing/pricing.service';

export interface CheckoutDto {
    shippingAddress: {
        label: string; line1: string; line2?: string;
        city: string; district: string; postalCode?: string; country?: string;
    };
    billingAddress?: {
        label: string; line1: string; line2?: string;
        city: string; district: string; postalCode?: string; country?: string;
    };
    paymentMethod?: 'wire_transfer' | 'credit_card' | 'deferred';
    customerNotes?: string;
    idempotencyKey?: string;
    flowMode?: 'direct' | 'quote_approval';
}

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(OrderEvent.name) private orderEventModel: Model<OrderEventDocument>,
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
        @InjectModel(StockMovement.name) private stockMovementModel: Model<StockMovementDocument>,
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        private pricingService: PricingService,
    ) { }

    /** Sipariş numarası üretici — ENT-YYYYMMDD-XXXXX */
    private async generateOrderNumber(): Promise<string> {
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const prefix = `ENT-${dateStr}`;

        const todayCount = await this.orderModel.countDocuments({
            orderNumber: { $regex: `^${prefix}` },
        });

        const seq = String(todayCount + 1).padStart(5, '0');
        return `${prefix}-${seq}`;
    }

    /** Checkout — sepetten sipariş oluştur */
    async checkout(
        userId: string,
        customerId: string,
        dto: CheckoutDto,
        requestId: string,
    ) {
        // Idempotency kontrolü
        if (dto.idempotencyKey) {
            const existing = await this.orderModel.findOne({
                idempotencyKey: dto.idempotencyKey,
            });
            if (existing) return existing;
        }

        // Sepeti al
        const cart = await this.cartModel.findOne({
            userId: new Types.ObjectId(userId),
        });
        if (!cart || cart.items.length === 0) {
            throw new BadRequestException('Sepet boş');
        }

        // Fiyat hesapla
        const cartItems = cart.items.map((i) => ({
            productId: i.productId.toString(),
            quantity: i.quantity,
        }));
        const cartTotal = await this.pricingService.calculateCartTotal(
            cartItems,
            customerId,
        );

        // Sipariş numarası
        const orderNumber = await this.generateOrderNumber();

        // Sipariş kalemleri
        const orderItems = cartTotal.items.map((item: any) => ({
            productId: new Types.ObjectId(item.productId),
            sku: item.sku,
            title: `Ürün ${item.sku}`,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountAmount: item.basePrice - item.unitPrice > 0
                ? Math.round((item.basePrice - item.unitPrice) * item.quantity * 100) / 100
                : 0,
            totalPrice: item.lineTotal,
            vatRate: item.vatRate,
        }));

        const flowMode = dto.flowMode || 'direct';
        const initialStatus = flowMode === 'quote_approval' ? 'quote_requested' : 'pending';

        // Sipariş oluştur
        const order = await this.orderModel.create({
            orderNumber,
            userId: new Types.ObjectId(userId),
            customerId: new Types.ObjectId(customerId),
            status: initialStatus,
            flowMode,
            items: orderItems,
            shippingAddress: dto.shippingAddress,
            billingAddress: dto.billingAddress || dto.shippingAddress,
            subtotal: cartTotal.subtotal,
            discountTotal: 0,
            shippingCost: 0,
            vatTotal: cartTotal.vatTotal,
            grandTotal: cartTotal.grandTotal,
            currency: 'TRY',
            paymentMethod: dto.paymentMethod,
            customerNotes: dto.customerNotes,
            idempotencyKey: dto.idempotencyKey,
            requestId,
        });

        // Stok rezervasyonu
        for (const item of cart.items) {
            await this.inventoryModel.updateOne(
                { productId: item.productId, variantId: item.variantId },
                { $inc: { reservedQuantity: item.quantity } },
            );
        }

        // Order event — outbox pattern
        await this.orderEventModel.create({
            orderId: order._id,
            eventType: flowMode === 'quote_approval' ? 'quote.requested' : 'order.created',
            payload: { orderNumber, grandTotal: cartTotal.grandTotal },
            actorId: new Types.ObjectId(userId),
            requestId,
            processed: false,
        });

        // Sepeti temizle
        await this.cartModel.updateOne(
            { userId: new Types.ObjectId(userId) },
            { items: [] },
        );

        this.logger.log(`Sipariş oluşturuldu: ${orderNumber} [${requestId}]`);
        return order;
    }

    /** Sipariş listesi */
    async findByCustomer(customerId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.orderModel
                .find({ customerId: new Types.ObjectId(customerId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.orderModel.countDocuments({ customerId: new Types.ObjectId(customerId) }),
        ]);
        return {
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    /** Sipariş detayı */
    async findById(id: string) {
        const order = await this.orderModel.findById(id).lean();
        if (!order) throw new NotFoundException('Sipariş bulunamadı');
        return order;
    }

    async findByOrderNumber(orderNumber: string) {
        const order = await this.orderModel.findOne({ orderNumber }).lean();
        if (!order) throw new NotFoundException('Sipariş bulunamadı');
        return order;
    }

    /** Durum güncelleme */
    async updateStatus(
        id: string,
        newStatus: string,
        actorId: string,
        requestId: string,
        internalNotes?: string,
        cancelReason?: string,
    ) {
        const order = await this.orderModel.findById(id);
        if (!order) throw new NotFoundException('Sipariş bulunamadı');

        const oldStatus = order.status;
        order.status = newStatus;
        if (internalNotes) order.internalNotes = internalNotes;
        if (cancelReason) order.cancelReason = cancelReason;
        await order.save();

        // Stok serbest bırakma (iptal veya iade)
        if (['cancelled', 'returned', 'refunded'].includes(newStatus)) {
            for (const item of order.items) {
                await this.inventoryModel.updateOne(
                    { productId: item.productId },
                    { $inc: { reservedQuantity: -item.quantity } },
                );
            }
        }

        // Stok düşme (sevkiyat)
        if (newStatus === 'shipped' && oldStatus !== 'shipped') {
            for (const item of order.items) {
                await this.inventoryModel.updateOne(
                    { productId: item.productId },
                    {
                        $inc: {
                            quantity: -item.quantity,
                            reservedQuantity: -item.quantity,
                        },
                    },
                );

                await this.stockMovementModel.create({
                    productId: item.productId,
                    warehouseId: null, // TODO: depo atama
                    type: 'out',
                    quantity: item.quantity,
                    reason: `Sipariş sevkiyatı: ${order.orderNumber}`,
                    orderId: order._id,
                    createdBy: new Types.ObjectId(actorId),
                    requestId,
                });
            }
        }

        // Order event
        await this.orderEventModel.create({
            orderId: order._id,
            eventType: `order.${newStatus}`,
            payload: { oldStatus, newStatus },
            actorId: new Types.ObjectId(actorId),
            requestId,
            processed: false,
        });

        this.logger.log(
            `Sipariş durumu: ${order.orderNumber} ${oldStatus} → ${newStatus} [${requestId}]`,
        );
        return order;
    }

    /** Yeniden sipariş — önceki siparişi sepete kopyala */
    async reorder(orderId: string, userId: string) {
        const order = await this.orderModel.findById(orderId).lean();
        if (!order) throw new NotFoundException('Sipariş bulunamadı');

        const cart = await this.cartModel.findOne({
            userId: new Types.ObjectId(userId),
        }) || new this.cartModel({ userId: new Types.ObjectId(userId), items: [] });

        for (const item of order.items) {
            const price = await this.pricingService.calculatePrice({
                productId: item.productId.toString(),
                quantity: item.quantity,
            });

            cart.items.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: price.unitPrice,
            } as any);
        }

        await cart.save();
        return cart;
    }

    /** Tüm siparişler (admin) */
    async findAll(page = 1, limit = 20, status?: string) {
        const query: Record<string, unknown> = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.orderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.orderModel.countDocuments(query),
        ]);
        return {
            data,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
