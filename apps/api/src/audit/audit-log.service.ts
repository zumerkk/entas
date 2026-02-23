import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../database/schemas/audit-log.schema';

export interface AuditLogParams {
    actorId: string;
    actorRole: string;
    actorEmail?: string;
    entityType: string;
    entityId: string;
    action: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    diff?: Record<string, unknown>;
    requestId: string;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class AuditLogService {
    private readonly logger = new Logger(AuditLogService.name);

    constructor(
        @InjectModel(AuditLog.name)
        private auditLogModel: Model<AuditLogDocument>,
    ) { }

    /**
     * Audit log kaydı oluştur.
     * Fire-and-forget: hata fırlatmaz, sadece loglar.
     */
    async log(params: AuditLogParams): Promise<void> {
        try {
            // before ve after varsa diff oluştur
            let diff = params.diff;
            if (!diff && params.before && params.after) {
                diff = this.computeDiff(params.before, params.after);
            }

            await this.auditLogModel.create({
                ...params,
                diff,
            });
        } catch (error) {
            // Audit log hatası uygulamayı kırmamalı
            this.logger.error(
                `Audit log yazılamadı: ${error} [${params.requestId}]`,
            );
        }
    }

    /**
     * Belirli bir entity'nin audit geçmişini getir.
     */
    async getEntityHistory(
        entityType: string,
        entityId: string,
        limit = 50,
        cursor?: string,
    ) {
        const query: Record<string, unknown> = { entityType, entityId };
        if (cursor) {
            query._id = { $lt: cursor };
        }

        const logs = await this.auditLogModel
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit + 1)
            .lean();

        const hasMore = logs.length > limit;
        const data = hasMore ? logs.slice(0, limit) : logs;

        return {
            data,
            pagination: {
                nextCursor: hasMore ? data[data.length - 1]._id.toString() : null,
                hasMore,
            },
        };
    }

    /**
     * Basit diff hesaplama — before/after JSON karşılaştırması.
     */
    private computeDiff(
        before: Record<string, unknown>,
        after: Record<string, unknown>,
    ): Record<string, unknown> {
        const diff: Record<string, unknown> = {};
        const allKeys = new Set([
            ...Object.keys(before),
            ...Object.keys(after),
        ]);

        for (const key of allKeys) {
            const oldVal = before[key];
            const newVal = after[key];
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                diff[key] = { from: oldVal, to: newVal };
            }
        }

        return diff;
    }
}
