import {
    Injectable, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Shipment, ShipmentDocument } from '../database/schemas/shipment.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema';

export interface CreateShipmentDto {
    orderId: string;
    carrier: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    items?: { productId: string; quantity: number }[];
    notes?: string;
}

@Injectable()
export class ShipmentsService {
    private readonly logger = new Logger(ShipmentsService.name);

    constructor(
        @InjectModel(Shipment.name) private shipmentModel: Model<ShipmentDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    async create(dto: CreateShipmentDto, createdBy: string) {
        const order = await this.orderModel.findById(dto.orderId);
        if (!order) throw new NotFoundException('Sipariş bulunamadı');

        const shipment = await this.shipmentModel.create({
            orderId: new Types.ObjectId(dto.orderId),
            customerId: order.customerId,
            carrier: dto.carrier,
            trackingNumber: dto.trackingNumber,
            status: 'preparing',
            estimatedDelivery: dto.estimatedDelivery,
            items: dto.items?.map((i) => ({
                productId: new Types.ObjectId(i.productId),
                quantity: i.quantity,
            })),
            notes: dto.notes,
            createdBy: new Types.ObjectId(createdBy),
        });

        this.logger.log(`Sevkiyat oluşturuldu: ${shipment._id} → Sipariş ${order.orderNumber}`);
        return shipment;
    }

    async updateStatus(
        id: string,
        status: string,
        trackingNumber?: string,
        trackingUrl?: string,
    ) {
        const update: Record<string, unknown> = { status };
        if (trackingNumber) update.trackingNumber = trackingNumber;
        if (trackingUrl) update.trackingUrl = trackingUrl;
        if (status === 'shipped') update.shippedAt = new Date();
        if (status === 'delivered') update.deliveredAt = new Date();

        const shipment = await this.shipmentModel.findByIdAndUpdate(id, update, { new: true });
        if (!shipment) throw new NotFoundException('Sevkiyat bulunamadı');
        return shipment;
    }

    async findByOrder(orderId: string) {
        return this.shipmentModel
            .find({ orderId: new Types.ObjectId(orderId) })
            .sort({ createdAt: -1 })
            .lean();
    }

    async findById(id: string) {
        const shipment = await this.shipmentModel.findById(id).lean();
        if (!shipment) throw new NotFoundException('Sevkiyat bulunamadı');
        return shipment;
    }

    async findAll(page = 1, limit = 20, status?: string) {
        const query: FilterQuery<ShipmentDocument> = {};
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.shipmentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.shipmentModel.countDocuments(query),
        ]);
        return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async trackShipment(trackingNumber: string) {
        const shipment = await this.shipmentModel.findOne({ trackingNumber }).lean();
        if (!shipment) throw new NotFoundException('Kargo bulunamadı');
        return {
            trackingNumber,
            carrier: shipment.carrier,
            status: shipment.status,
            shippedAt: shipment.shippedAt,
            estimatedDelivery: shipment.estimatedDelivery,
            deliveredAt: shipment.deliveredAt,
        };
    }
}
