import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({
    timestamps: true,
    collection: 'webhook_events',
    toJSON: { virtuals: true, versionKey: false },
})
export class WebhookEvent {
    @Prop({ required: true, index: true })
    eventType: string;

    @Prop({ type: Object, required: true })
    payload: Record<string, unknown>;

    @Prop({ unique: true, sparse: true })
    idempotencyKey?: string;

    @Prop({ required: true, enum: ['pending', 'delivered', 'failed', 'no_subscribers'], default: 'pending' })
    status: string;

    @Prop({ default: 0 })
    attempts: number;

    @Prop({ default: 5 })
    maxAttempts: number;

    @Prop()
    lastAttemptAt?: Date;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

WebhookEventSchema.index({ eventType: 1, createdAt: -1 });
WebhookEventSchema.index({ status: 1, attempts: 1 });
WebhookEventSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
