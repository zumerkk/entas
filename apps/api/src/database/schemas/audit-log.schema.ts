import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AuditLogDocument = AuditLog & Document;

@Schema({
    timestamps: true,
    collection: 'auditLogs',
    toJSON: { virtuals: true, versionKey: false },
})
export class AuditLog {
    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    actorId: Types.ObjectId;

    @ApiProperty()
    @Prop({ required: true })
    actorRole: string;

    @ApiProperty()
    @Prop()
    actorEmail?: string;

    @ApiProperty()
    @Prop({ required: true })
    entityType: string;

    @ApiProperty()
    @Prop({ required: true })
    entityId: string;

    @ApiProperty()
    @Prop({
        required: true,
        enum: [
            'create', 'update', 'delete',
            'price_change', 'stock_change',
            'status_change', 'role_change',
            'import_start', 'import_complete', 'import_error',
            'login', 'logout', 'login_failed',
        ],
    })
    action: string;

    @ApiProperty()
    @Prop({ type: Object })
    before?: Record<string, unknown>;

    @ApiProperty()
    @Prop({ type: Object })
    after?: Record<string, unknown>;

    @ApiProperty()
    @Prop({ type: Object })
    diff?: Record<string, unknown>;

    @ApiProperty()
    @Prop({ required: true })
    requestId: string;

    @ApiProperty()
    @Prop()
    ipAddress?: string;

    @ApiProperty()
    @Prop()
    userAgent?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ actorId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ requestId: 1 });
AuditLogSchema.index({ createdAt: -1 });
// 1 yıl TTL — regulasyona göre ayarla
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
