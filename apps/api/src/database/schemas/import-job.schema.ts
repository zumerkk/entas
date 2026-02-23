import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ImportJobDocument = ImportJob & Document;

@Schema({
    timestamps: true,
    collection: 'importJobs',
    toJSON: { virtuals: true, versionKey: false },
})
export class ImportJob {
    @Prop({ required: true, enum: ['products', 'prices', 'customers', 'inventory'] })
    type: string;

    @Prop({
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'stopped'],
        default: 'pending',
    })
    status: string;

    @Prop({ required: true })
    fileName: string;

    @Prop()
    fileUrl?: string;

    @Prop()
    fileHash?: string;

    @Prop({ default: 0 })
    totalRows: number;

    @Prop({ default: 0 })
    processedRows: number;

    @Prop({ default: 0 })
    successRows: number;

    @Prop({ default: 0 })
    errorRows: number;

    @Prop()
    startedAt?: Date;

    @Prop()
    completedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop()
    errorReportUrl?: string;

    @Prop({ type: Object })
    options?: Record<string, unknown>;
}

export const ImportJobSchema = SchemaFactory.createForClass(ImportJob);

ImportJobSchema.index({ status: 1, createdAt: -1 });
ImportJobSchema.index({ type: 1 });
ImportJobSchema.index({ createdBy: 1 });
ImportJobSchema.index({ fileHash: 1 }, { sparse: true });

// ─── Import Job Errors ───
export type ImportJobErrorDocument = ImportJobError & Document;

@Schema({
    timestamps: true,
    collection: 'importJobErrors',
    toJSON: { virtuals: true, versionKey: false },
})
export class ImportJobError {
    @Prop({ type: Types.ObjectId, ref: 'ImportJob', required: true })
    jobId: Types.ObjectId;

    @Prop({ required: true })
    rowNumber: number;

    @Prop()
    rowHash?: string;

    @Prop({ type: Object })
    rowData?: Record<string, unknown>;

    @Prop({ required: true })
    errorMessage: string;

    @Prop()
    field?: string;
}

export const ImportJobErrorSchema = SchemaFactory.createForClass(ImportJobError);

ImportJobErrorSchema.index({ jobId: 1, rowNumber: 1 });
