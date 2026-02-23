import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WebhookEvent, WebhookEventDocument } from '../database/schemas/system.schema';
import * as crypto from 'crypto';

export interface WebhookConfig {
    url: string;
    secret: string;
    events: string[];
    isActive: boolean;
}

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    // In-memory webhook configs — production'da Setting/DB'den alınabilir
    private webhookConfigs: WebhookConfig[] = [];

    constructor(
        @InjectModel(WebhookEvent.name) private eventModel: Model<WebhookEventDocument>,
    ) { }

    /** Webhook config kaydet */
    registerWebhook(config: WebhookConfig) {
        this.webhookConfigs.push(config);
        this.logger.log(`Webhook kaydedildi: ${config.url} → [${config.events.join(', ')}]`);
    }

    /** Event dispatch — fire and forget, retry ile */
    async dispatch(eventType: string, payload: Record<string, unknown>, idempotencyKey?: string) {
        // Idempotency kontrolü
        if (idempotencyKey) {
            const existing = await this.eventModel.findOne({ idempotencyKey });
            if (existing) {
                this.logger.debug(`Webhook skip (idempotent): ${idempotencyKey}`);
                return existing;
            }
        }

        const event = await this.eventModel.create({
            eventType,
            payload,
            idempotencyKey: idempotencyKey || crypto.randomUUID(),
            status: 'pending',
            attempts: 0,
            maxAttempts: 5,
        });

        // Async delivery — fire and forget
        this.deliverEvent(event).catch((err) => {
            this.logger.error(`Webhook delivery hatası: ${err.message}`);
        });

        return event;
    }

    /** Event'i tüm eşleşen webhook'lara gönder */
    private async deliverEvent(event: WebhookEventDocument) {
        const matchingHooks = this.webhookConfigs.filter(
            (c) => c.isActive && c.events.includes(event.eventType),
        );

        if (matchingHooks.length === 0) {
            await this.eventModel.updateOne({ _id: event._id }, { status: 'no_subscribers' });
            return;
        }

        let allSuccess = true;

        for (const hook of matchingHooks) {
            try {
                const signature = crypto
                    .createHmac('sha256', hook.secret)
                    .update(JSON.stringify(event.payload))
                    .digest('hex');

                const response = await fetch(hook.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Webhook-Signature': signature,
                        'X-Webhook-Event': event.eventType,
                        'X-Webhook-Id': event._id.toString(),
                    },
                    body: JSON.stringify({
                        event: event.eventType,
                        payload: event.payload,
                        timestamp: new Date().toISOString(),
                    }),
                    signal: AbortSignal.timeout(10000),
                });

                if (!response.ok) {
                    allSuccess = false;
                    this.logger.warn(`Webhook ${hook.url} → ${response.status}`);
                }
            } catch (error: any) {
                allSuccess = false;
                this.logger.error(`Webhook ${hook.url} hatası: ${error.message}`);
            }
        }

        await this.eventModel.updateOne(
            { _id: event._id },
            {
                status: allSuccess ? 'delivered' : 'failed',
                attempts: (event as any).attempts + 1,
                lastAttemptAt: new Date(),
            },
        );
    }

    /** Başarısız event'leri yeniden gönder */
    async retryFailed() {
        const failed = await this.eventModel.find({
            status: 'failed',
            attempts: { $lt: 5 },
        }).limit(50);

        let retried = 0;
        for (const event of failed) {
            await this.deliverEvent(event);
            retried++;
        }

        return { retried };
    }

    /** Event listesi */
    async findAll(page = 1, limit = 20, status?: string) {
        const query: Record<string, unknown> = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.eventModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.eventModel.countDocuments(query),
        ]);
        return { data, pagination: { page, limit, total } };
    }
}
