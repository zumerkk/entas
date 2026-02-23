import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { PricingService } from '../pricing/pricing.service';

@Injectable()
export class CartService {
    private readonly logger = new Logger(CartService.name);

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        private pricingService: PricingService,
    ) { }

    async getCart(userId: string): Promise<any> {
        let cart: any = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
        if (!cart) {
            const created = await this.cartModel.create({ userId: new Types.ObjectId(userId), items: [] });
            cart = created.toObject();
        }
        return cart;
    }

    async addItem(
        userId: string,
        productId: string,
        quantity: number,
        variantId?: string,
        note?: string,
    ) {
        if (quantity < 1) throw new BadRequestException('Miktar en az 1 olmalıdır');

        let cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!cart) {
            cart = new this.cartModel({ userId: new Types.ObjectId(userId), items: [] });
        }

        // Fiyat hesapla
        const price = await this.pricingService.calculatePrice({
            productId,
            quantity,
            customerId: cart.customerId?.toString(),
        });

        const existingIdx = cart.items.findIndex(
            (item) =>
                item.productId.toString() === productId &&
                (!variantId || item.variantId?.toString() === variantId),
        );

        if (existingIdx >= 0) {
            cart.items[existingIdx].quantity += quantity;
            cart.items[existingIdx].unitPrice = price.unitPrice;
            if (note) cart.items[existingIdx].note = note;
        } else {
            cart.items.push({
                productId: new Types.ObjectId(productId),
                variantId: variantId ? new Types.ObjectId(variantId) : undefined,
                quantity,
                unitPrice: price.unitPrice,
                note,
            } as any);
        }

        await cart.save();
        this.logger.log(`Sepete eklendi: user=${userId} product=${productId} qty=${quantity}`);
        return cart;
    }

    async updateItemQuantity(userId: string, productId: string, quantity: number) {
        if (quantity < 0) throw new BadRequestException('Miktar negatif olamaz');

        const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!cart) throw new NotFoundException('Sepet bulunamadı');

        const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
        if (idx < 0) throw new NotFoundException('Ürün sepette bulunamadı');

        if (quantity === 0) {
            cart.items.splice(idx, 1);
        } else {
            const price = await this.pricingService.calculatePrice({
                productId,
                quantity,
                customerId: cart.customerId?.toString(),
            });
            cart.items[idx].quantity = quantity;
            cart.items[idx].unitPrice = price.unitPrice;
        }

        await cart.save();
        return cart;
    }

    async removeItem(userId: string, productId: string) {
        const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!cart) throw new NotFoundException('Sepet bulunamadı');

        cart.items = cart.items.filter((i) => i.productId.toString() !== productId) as any;
        await cart.save();
        return cart;
    }

    async clearCart(userId: string) {
        await this.cartModel.updateOne(
            { userId: new Types.ObjectId(userId) },
            { items: [], couponCode: null, discountAmount: 0 },
        );
        return { cleared: true };
    }

    async applyCoupon(userId: string, couponCode: string) {
        const cart = await this.cartModel.findOne({ userId: new Types.ObjectId(userId) });
        if (!cart) throw new NotFoundException('Sepet bulunamadı');
        cart.couponCode = couponCode;
        await cart.save();
        return cart;
    }

    /** Sepet özetini fiyatlarla birlikte döndür */
    async getCartSummary(userId: string, customerId?: string) {
        const cart = await this.getCart(userId);
        if (!cart.items.length) {
            return { items: [], subtotal: 0, vatTotal: 0, grandTotal: 0, currency: 'TRY' };
        }

        const items = cart.items.map((i: any) => ({
            productId: i.productId.toString(),
            quantity: i.quantity,
        }));

        return this.pricingService.calculateCartTotal(items, customerId);
    }
}
