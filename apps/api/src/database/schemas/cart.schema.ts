import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

export class CartItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
    variantId?: Types.ObjectId;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ required: true })
    unitPrice: number;

    @Prop()
    note?: string;
}

@Schema({
    timestamps: true,
    collection: 'carts',
    toJSON: { virtuals: true, versionKey: false },
})
export class Cart {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Customer' })
    customerId?: Types.ObjectId;

    @Prop({ type: [Object], default: [] })
    items: CartItem[];

    @Prop({ default: 'TRY' })
    currency: string;

    @Prop()
    couponCode?: string;

    @Prop({ default: 0 })
    discountAmount: number;

    @Prop()
    notes?: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ userId: 1 }, { unique: true });
CartSchema.index({ customerId: 1 });
CartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // 30 gün TTL
