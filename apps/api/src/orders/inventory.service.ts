import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Inventory, InventoryDocument } from '../database/schemas/inventory.schema';
import { StockMovement, StockMovementDocument } from '../database/schemas/stock-movement.schema';
import { Warehouse, WarehouseDocument } from '../database/schemas/warehouse.schema';

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
        @InjectModel(StockMovement.name) private movementModel: Model<StockMovementDocument>,
        @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
    ) { }

    /** Ürün stok bilgisi (tüm depolar) */
    async getProductStock(productId: string) {
        const stocks = await this.inventoryModel
            .find({ productId: new Types.ObjectId(productId) })
            .populate('warehouseId', 'name code')
            .lean();

        const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);
        const totalReserved = stocks.reduce((sum, s) => sum + s.reservedQuantity, 0);

        return {
            productId,
            totalQuantity,
            totalReserved,
            availableQuantity: totalQuantity - totalReserved,
            warehouses: stocks,
        };
    }

    /** Stok girişi */
    async addStock(
        productId: string,
        warehouseId: string,
        quantity: number,
        reason: string,
        createdBy: string,
        requestId: string,
        variantId?: string,
    ) {
        const inventory = await this.inventoryModel.findOneAndUpdate(
            {
                productId: new Types.ObjectId(productId),
                warehouseId: new Types.ObjectId(warehouseId),
                variantId: variantId ? new Types.ObjectId(variantId) : undefined,
            },
            { $inc: { quantity } },
            { new: true, upsert: true },
        );

        await this.movementModel.create({
            productId: new Types.ObjectId(productId),
            variantId: variantId ? new Types.ObjectId(variantId) : undefined,
            warehouseId: new Types.ObjectId(warehouseId),
            type: 'in',
            quantity,
            previousQuantity: inventory.quantity - quantity,
            newQuantity: inventory.quantity,
            reason,
            createdBy: new Types.ObjectId(createdBy),
            requestId,
        });

        this.logger.log(`Stok girişi: ${productId} +${quantity} [${requestId}]`);
        return inventory;
    }

    /** Stok çıkışı */
    async removeStock(
        productId: string,
        warehouseId: string,
        quantity: number,
        reason: string,
        createdBy: string,
        requestId: string,
    ) {
        const inventory = await this.inventoryModel.findOne({
            productId: new Types.ObjectId(productId),
            warehouseId: new Types.ObjectId(warehouseId),
        });

        if (!inventory) throw new NotFoundException('Stok kaydı bulunamadı');
        if (inventory.quantity - inventory.reservedQuantity < quantity) {
            throw new Error('Yetersiz stok');
        }

        inventory.quantity -= quantity;
        await inventory.save();

        await this.movementModel.create({
            productId: new Types.ObjectId(productId),
            warehouseId: new Types.ObjectId(warehouseId),
            type: 'out',
            quantity,
            previousQuantity: inventory.quantity + quantity,
            newQuantity: inventory.quantity,
            reason,
            createdBy: new Types.ObjectId(createdBy),
            requestId,
        });

        return inventory;
    }

    /** Stok hareketleri */
    async getMovements(productId: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.movementModel
                .find({ productId: new Types.ObjectId(productId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('warehouseId', 'name code')
                .lean(),
            this.movementModel.countDocuments({ productId: new Types.ObjectId(productId) }),
        ]);
        return { data, pagination: { page, limit, total } };
    }

    /** Kritik stok uyarıları */
    async getLowStockAlerts() {
        return this.inventoryModel.aggregate([
            {
                $match: {
                    reorderPoint: { $exists: true, $gt: 0 },
                },
            },
            {
                $addFields: {
                    availableQty: { $subtract: ['$quantity', '$reservedQuantity'] },
                },
            },
            {
                $match: {
                    $expr: { $lte: ['$availableQty', '$reorderPoint'] },
                },
            },
            { $sort: { availableQty: 1 } },
            { $limit: 100 },
        ]);
    }

    /** Depolar */
    async getWarehouses() {
        return this.warehouseModel.find({ isActive: true }).sort({ name: 1 }).lean();
    }
}
