import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockMovementDocument = StockMovement & Document;

@Schema({
    timestamps: true,
    collection: 'stockMovements',
    toJSON: { virtuals: true, versionKey: false },
})
export class StockMovement {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
    variantId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
    warehouseId: Types.ObjectId;

    @Prop({ required: true, enum: ['in', 'out', 'adjustment', 'transfer', 'return'] })
    type: string;

    @Prop({ required: true })
    quantity: number;

    @Prop()
    previousQuantity?: number;

    @Prop()
    newQuantity?: number;

    @Prop()
    reason?: string;

    @Prop({ type: Types.ObjectId, ref: 'Order' })
    orderId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop()
    requestId?: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);

StockMovementSchema.index({ productId: 1, createdAt: -1 });
StockMovementSchema.index({ warehouseId: 1, createdAt: -1 });
StockMovementSchema.index({ type: 1 });
StockMovementSchema.index({ orderId: 1 }, { sparse: true });
StockMovementSchema.index({ createdAt: -1 });
