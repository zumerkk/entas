import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { Customer, CustomerDocument } from '../database/schemas/customer.schema';
import { Inventory, InventoryDocument } from '../database/schemas/inventory.schema';
import { AuditLog, AuditLogDocument } from '../database/schemas/audit-log.schema';

@Injectable()
export class ReportsService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
        @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
        @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>,
    ) { }

    /** Dashboard — genel istatistikler */
    async getDashboard() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [
            totalOrders, monthlyOrders, todayOrders,
            totalCustomers, activeProducts,
            monthlyRevenue, pendingOrders,
            lowStockCount,
        ] = await Promise.all([
            this.orderModel.countDocuments(),
            this.orderModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
            this.orderModel.countDocuments({ createdAt: { $gte: startOfDay } }),
            this.customerModel.countDocuments({ isActive: true }),
            this.productModel.countDocuments({ isActive: true }),
            this.orderModel.aggregate([
                { $match: { createdAt: { $gte: startOfMonth }, status: { $nin: ['cancelled', 'refunded'] } } },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } },
            ]),
            this.orderModel.countDocuments({ status: 'pending' }),
            this.inventoryModel.aggregate([
                { $match: { reorderPoint: { $exists: true, $gt: 0 } } },
                { $addFields: { availableQty: { $subtract: ['$quantity', '$reservedQuantity'] } } },
                { $match: { $expr: { $lte: ['$availableQty', '$reorderPoint'] } } },
                { $count: 'total' },
            ]),
        ]);

        return {
            orders: {
                total: totalOrders,
                monthly: monthlyOrders,
                today: todayOrders,
                pending: pendingOrders,
            },
            revenue: {
                monthly: monthlyRevenue[0]?.total || 0,
                currency: 'TRY',
            },
            customers: { total: totalCustomers },
            products: { active: activeProducts },
            inventory: { lowStockAlerts: lowStockCount[0]?.total || 0 },
        };
    }

    /** Sipariş gelir raporu — günlük/haftalık/aylık kırılım */
    async getRevenueReport(period: 'daily' | 'weekly' | 'monthly' = 'daily', days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        let dateFormat: string;
        switch (period) {
            case 'weekly': dateFormat = '%Y-W%V'; break;
            case 'monthly': dateFormat = '%Y-%m'; break;
            default: dateFormat = '%Y-%m-%d';
        }

        const result = await this.orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $nin: ['cancelled', 'refunded'] },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
                    orderCount: { $sum: 1 },
                    revenue: { $sum: '$grandTotal' },
                    avgOrderValue: { $avg: '$grandTotal' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return { period, days, data: result };
    }

    /** En çok satan ürünler */
    async getTopProducts(limit = 20) {
        return this.orderModel.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    sku: { $first: '$items.sku' },
                    totalSold: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.totalPrice' },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { totalSold: -1 } },
            { $limit: limit },
        ]);
    }

    /** En çok sipariş veren müşteriler */
    async getTopCustomers(limit = 20) {
        return this.orderModel.aggregate([
            {
                $group: {
                    _id: '$customerId',
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: '$grandTotal' },
                    avgOrderValue: { $avg: '$grandTotal' },
                    lastOrder: { $max: '$createdAt' },
                },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customer',
                    pipeline: [{ $project: { companyName: 1, accountCode: 1 } }],
                },
            },
            { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
        ]);
    }

    /** Sipariş durum dağılımı */
    async getOrderStatusDistribution() {
        return this.orderModel.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
    }

    /** Son aktiviteler (audit log) */
    async getRecentActivity(limit = 50) {
        return this.auditModel
            .find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    }
}
