import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({
    timestamps: true,
    collection: 'payments',
    toJSON: { virtuals: true, versionKey: false },
})
export class Payment {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    orderId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
    customerId: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ default: 'TRY' })
    currency: string;

    @Prop({ required: true, enum: ['wire_transfer', 'credit_card', 'deferred'] })
    method: string;

    @Prop({
        required: true,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending',
    })
    status: string;

    @Prop()
    transactionId?: string;

    @Prop()
    gatewayResponse?: string;

    @Prop()
    paidAt?: Date;

    @Prop()
    notes?: string;

    @Prop({ sparse: true })
    idempotencyKey?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ customerId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
