import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ImportJob, ImportJobDocument } from '../database/schemas/import-job.schema';
import { ImportJobError, ImportJobErrorDocument } from '../database/schemas/import-job.schema';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { Inventory, InventoryDocument } from '../database/schemas/inventory.schema';
import * as crypto from 'crypto';

export interface ImportRowProduct {
    sku: string;
    title: string;
    slug?: string;
    barcode?: string;
    basePrice: number;
    vatRate?: number;
    unit?: string;
    brandId?: string;
    categoryIds?: string[];
    description?: string;
    isActive?: boolean;
}

export interface ImportRowStock {
    sku: string;
    warehouseId: string;
    quantity: number;
    reorderPoint?: number;
}

@Injectable()
export class ImportService {
    private readonly logger = new Logger(ImportService.name);

    constructor(
        @InjectModel(ImportJob.name) private importJobModel: Model<ImportJobDocument>,
        @InjectModel(ImportJobError.name) private importErrorModel: Model<ImportJobErrorDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    ) { }

    /** İmport job oluştur */
    async createJob(
        fileName: string,
        fileSize: number,
        type: 'product' | 'stock' | 'price' | 'customer',
        createdBy: string,
        fileHash?: string,
    ) {
        const hash = fileHash || crypto.randomUUID();

        // Aynı dosya daha önce yüklendi mi?
        const existing = await this.importJobModel.findOne({
            fileHash: hash,
            status: { $in: ['completed', 'processing'] },
        });
        if (existing) {
            return { duplicate: true, existingJob: existing };
        }

        const job = await this.importJobModel.create({
            fileName,
            fileSize,
            type,
            fileHash: hash,
            status: 'pending',
            totalRows: 0,
            processedRows: 0,
            successRows: 0,
            errorRows: 0,
            createdBy: new Types.ObjectId(createdBy),
        });

        return { duplicate: false, job };
    }

    /** Ürün toplu import — row by row İşleme */
    async processProductImport(jobId: string, rows: ImportRowProduct[]) {
        const job = await this.importJobModel.findById(jobId);
        if (!job) throw new NotFoundException('Import job bulunamadı');

        job.status = 'processing';
        job.totalRows = rows.length;
        job.startedAt = new Date();
        await job.save();

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                // SKU üzerinden upsert
                await this.productModel.updateOne(
                    { sku: row.sku.toUpperCase() },
                    {
                        $set: {
                            title: row.title,
                            slug: row.slug || row.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                            barcode: row.barcode,
                            basePrice: row.basePrice,
                            vatRate: row.vatRate ?? 20,
                            unit: row.unit ?? 'adet',
                            description: row.description,
                            isActive: row.isActive ?? true,
                            brandId: row.brandId ? new Types.ObjectId(row.brandId) : undefined,
                            categoryIds: row.categoryIds?.map((id) => new Types.ObjectId(id)),
                        },
                        $setOnInsert: { sku: row.sku.toUpperCase() },
                    },
                    { upsert: true },
                );
                successCount++;
            } catch (error: any) {
                errorCount++;
                await this.importErrorModel.create({
                    importJobId: job._id,
                    rowNumber: i + 1,
                    rowData: row,
                    errorMessage: error.message || 'Bilinmeyen hata',
                    errorCode: error.code?.toString(),
                });
            }

            // Her 50 satırda ilerleme güncelle
            if ((i + 1) % 50 === 0 || i === rows.length - 1) {
                await this.importJobModel.updateOne(
                    { _id: job._id },
                    {
                        processedRows: i + 1,
                        successRows: successCount,
                        errorRows: errorCount,
                    },
                );
            }
        }

        // Tamamla
        await this.importJobModel.updateOne(
            { _id: job._id },
            {
                status: errorCount > 0 ? 'completed_with_errors' : 'completed',
                processedRows: rows.length,
                successRows: successCount,
                errorRows: errorCount,
                completedAt: new Date(),
            },
        );

        this.logger.log(
            `Import tamamlandı: ${job.fileName} — ${successCount} başarılı, ${errorCount} hatalı`,
        );

        return {
            jobId,
            totalRows: rows.length,
            successRows: successCount,
            errorRows: errorCount,
            status: errorCount > 0 ? 'completed_with_errors' : 'completed',
        };
    }

    /** Stok toplu import */
    async processStockImport(jobId: string, rows: ImportRowStock[]) {
        const job = await this.importJobModel.findById(jobId);
        if (!job) throw new NotFoundException('Import job bulunamadı');

        job.status = 'processing';
        job.totalRows = rows.length;
        job.startedAt = new Date();
        await job.save();

        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            try {
                const product = await this.productModel.findOne({ sku: row.sku.toUpperCase() });
                if (!product) throw new Error(`Ürün bulunamadı: ${row.sku}`);

                await this.inventoryModel.updateOne(
                    {
                        productId: product._id,
                        warehouseId: new Types.ObjectId(row.warehouseId),
                    },
                    {
                        $set: {
                            quantity: row.quantity,
                            reorderPoint: row.reorderPoint ?? 10,
                        },
                    },
                    { upsert: true },
                );
                successCount++;
            } catch (error: any) {
                errorCount++;
                await this.importErrorModel.create({
                    importJobId: job._id,
                    rowNumber: i + 1,
                    rowData: row,
                    errorMessage: error.message,
                });
            }
        }

        await this.importJobModel.updateOne(
            { _id: job._id },
            {
                status: errorCount > 0 ? 'completed_with_errors' : 'completed',
                processedRows: rows.length,
                successRows: successCount,
                errorRows: errorCount,
                completedAt: new Date(),
            },
        );

        return { jobId, totalRows: rows.length, successRows: successCount, errorRows: errorCount };
    }

    /** Job listesi */
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.importJobModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate('createdBy', 'firstName lastName email').lean(),
            this.importJobModel.countDocuments(),
        ]);
        return { data, pagination: { page, limit, total } };
    }

    /** Job detayı + hatalar */
    async findById(id: string): Promise<any> {
        const job = await this.importJobModel.findById(id)
            .populate('createdBy', 'firstName lastName email').lean();
        if (!job) throw new NotFoundException('Import job bulunamadı');

        const errors = await this.importErrorModel
            .find({ importJobId: job._id })
            .sort({ rowNumber: 1 })
            .limit(100)
            .lean();

        return { ...job, errors };
    }
}
