import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderEventDocument = OrderEvent & Document;

@Schema({
    timestamps: true,
    collection: 'orderEvents',
    toJSON: { virtuals: true, versionKey: false },
})
export class OrderEvent {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    orderId: Types.ObjectId;

    @Prop({
        required: true,
        enum: [
            'order.created', 'order.confirmed', 'order.processing',
            'order.shipped', 'order.delivered', 'order.cancelled',
            'order.returned', 'order.refunded',
            'quote.requested', 'quote.sent', 'quote.approved', 'quote.rejected',
            'payment.received', 'payment.failed',
            'shipment.created', 'shipment.updated',
        ],
    })
    eventType: string;

    @Prop({ type: Object })
    payload?: Record<string, unknown>;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    actorId?: Types.ObjectId;

    @Prop()
    requestId?: string;

    /** Outbox pattern: işlenip işlenmediği */
    @Prop({ default: false })
    processed: boolean;

    @Prop()
    processedAt?: Date;

    @Prop({ default: 0 })
    retryCount: number;
}

export const OrderEventSchema = SchemaFactory.createForClass(OrderEvent);

OrderEventSchema.index({ orderId: 1, createdAt: -1 });
OrderEventSchema.index({ eventType: 1 });
OrderEventSchema.index({ processed: 1, createdAt: 1 }); // Outbox polling
OrderEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // 90 gün TTL
