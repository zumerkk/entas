import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OrderDocument = Order & Document;

export class OrderItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
    variantId?: Types.ObjectId;

    @Prop({ required: true })
    sku: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true, min: 1 })
    quantity: number;

    @Prop({ required: true })
    unitPrice: number;

    @Prop({ default: 0 })
    discountAmount: number;

    @Prop({ required: true })
    totalPrice: number;

    @Prop({ default: 20 })
    vatRate: number;
}

export class OrderAddress {
    @Prop({ required: true })
    label: string;

    @Prop({ required: true })
    line1: string;

    @Prop()
    line2?: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    district: string;

    @Prop()
    postalCode?: string;

    @Prop({ default: 'TR' })
    country: string;
}

@Schema({
    timestamps: true,
    collection: 'orders',
    toJSON: { virtuals: true, versionKey: false },
})
export class Order {
    @ApiProperty()
    @Prop({ required: true, unique: true })
    orderNumber: string;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
    customerId: Types.ObjectId;

    @ApiProperty({
        enum: [
            'pending', 'confirmed', 'processing', 'shipped',
            'delivered', 'cancelled', 'returned', 'refunded',
            // Teklif modu için:
            'quote_requested', 'quote_sent', 'quote_approved', 'quote_rejected',
        ],
    })
    @Prop({
        required: true,
        enum: [
            'pending', 'confirmed', 'processing', 'shipped',
            'delivered', 'cancelled', 'returned', 'refunded',
            'quote_requested', 'quote_sent', 'quote_approved', 'quote_rejected',
        ],
        default: 'pending',
    })
    status: string;

    @ApiProperty({ enum: ['direct', 'quote_approval'] })
    @Prop({ enum: ['direct', 'quote_approval'], default: 'direct' })
    flowMode: string;

    @ApiProperty()
    @Prop({ type: [Object], required: true })
    items: OrderItem[];

    @ApiProperty()
    @Prop({ type: Object })
    shippingAddress: OrderAddress;

    @ApiProperty()
    @Prop({ type: Object })
    billingAddress: OrderAddress;

    @ApiProperty()
    @Prop({ required: true })
    subtotal: number;

    @ApiProperty()
    @Prop({ default: 0 })
    discountTotal: number;

    @ApiProperty()
    @Prop({ default: 0 })
    shippingCost: number;

    @ApiProperty()
    @Prop({ required: true })
    vatTotal: number;

    @ApiProperty()
    @Prop({ required: true })
    grandTotal: number;

    @ApiProperty()
    @Prop({ default: 'TRY' })
    currency: string;

    @ApiProperty({ enum: ['wire_transfer', 'credit_card', 'deferred'] })
    @Prop({ enum: ['wire_transfer', 'credit_card', 'deferred'] })
    paymentMethod?: string;

    @ApiProperty()
    @Prop()
    couponCode?: string;

    @ApiProperty()
    @Prop()
    customerNotes?: string;

    @ApiProperty()
    @Prop()
    internalNotes?: string;

    @ApiProperty()
    @Prop()
    cancelReason?: string;

    @ApiProperty({ description: 'Idempotency key' })
    @Prop({ sparse: true })
    idempotencyKey?: string;

    @ApiProperty()
    @Prop()
    requestId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// ─── İndeksler ───
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ flowMode: 1, status: 1 });
OrderSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
OrderSchema.index({ createdAt: -1 });
