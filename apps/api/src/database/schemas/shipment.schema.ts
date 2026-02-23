import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ShipmentDocument = Shipment & Document;

@Schema({
    timestamps: true,
    collection: 'shipments',
    toJSON: { virtuals: true, versionKey: false },
})
export class Shipment {
    @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
    orderId: Types.ObjectId;

    @Prop({ required: true, enum: ['preparing', 'shipped', 'in_transit', 'delivered', 'returned'], default: 'preparing' })
    status: string;

    @Prop()
    trackingNumber?: string;

    @Prop()
    carrier?: string;

    @Prop()
    estimatedDelivery?: Date;

    @Prop()
    shippedAt?: Date;

    @Prop()
    deliveredAt?: Date;

    @Prop()
    notes?: string;
}

export const ShipmentSchema = SchemaFactory.createForClass(Shipment);

ShipmentSchema.index({ orderId: 1 });
ShipmentSchema.index({ status: 1 });
ShipmentSchema.index({ trackingNumber: 1 }, { sparse: true });
