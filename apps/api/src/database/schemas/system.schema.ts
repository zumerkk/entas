import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ─── WebhookEvent ───
export type WebhookEventDocument = WebhookEvent & Document;

@Schema({
    timestamps: true,
    collection: 'webhookEvents',
    toJSON: { virtuals: true, versionKey: false },
})
export class WebhookEvent {
    @Prop({ required: true })
    eventType: string;

    @Prop({ type: Object, required: true })
    payload: Record<string, unknown>;

    @Prop({ required: true, unique: true })
    idempotencyKey: string;

    @Prop({ default: false })
    processed: boolean;

    @Prop()
    processedAt?: Date;

    @Prop({ default: 0 })
    retryCount: number;

    @Prop()
    lastError?: string;

    @Prop()
    source?: string;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);

WebhookEventSchema.index({ idempotencyKey: 1 }, { unique: true });
WebhookEventSchema.index({ processed: 1, createdAt: 1 });
WebhookEventSchema.index({ eventType: 1 });
WebhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// ─── SyncJob ───
export type SyncJobDocument = SyncJob & Document;

@Schema({
    timestamps: true,
    collection: 'syncJobs',
    toJSON: { virtuals: true, versionKey: false },
})
export class SyncJob {
    @Prop({ required: true, enum: ['trendyol', 'erp', 'marketplace_other'] })
    adapter: string;

    @Prop({ required: true, enum: ['pending', 'running', 'completed', 'failed'], default: 'pending' })
    status: string;

    @Prop({ required: true, enum: ['full', 'incremental'], default: 'incremental' })
    syncType: string;

    @Prop()
    startedAt?: Date;

    @Prop()
    completedAt?: Date;

    @Prop({ default: 0 })
    itemsSynced: number;

    @Prop({ default: 0 })
    errors: number;

    @Prop()
    lastError?: string;

    @Prop({ type: Object })
    metadata?: Record<string, unknown>;
}

export const SyncJobSchema = SchemaFactory.createForClass(SyncJob);

SyncJobSchema.index({ adapter: 1, createdAt: -1 });
SyncJobSchema.index({ status: 1 });

// ─── Settings ───
export type SettingDocument = Setting & Document;

@Schema({
    timestamps: true,
    collection: 'settings',
    toJSON: { virtuals: true, versionKey: false },
})
export class Setting {
    @Prop({ required: true, unique: true })
    key: string;

    @Prop({ type: Object, required: true })
    value: unknown;

    @Prop()
    description?: string;

    @Prop({ enum: ['string', 'number', 'boolean', 'json'], default: 'string' })
    type: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);

SettingSchema.index({ key: 1 }, { unique: true });

// ─── FeatureFlag ───
export type FeatureFlagDocument = FeatureFlag & Document;

@Schema({
    timestamps: true,
    collection: 'featureFlags',
    toJSON: { virtuals: true, versionKey: false },
})
export class FeatureFlag {
    @Prop({ required: true, unique: true })
    key: string;

    @Prop({ required: true, default: false })
    enabled: boolean;

    @Prop()
    description?: string;

    @Prop({ type: Object })
    metadata?: Record<string, unknown>;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);

FeatureFlagSchema.index({ key: 1 }, { unique: true });
