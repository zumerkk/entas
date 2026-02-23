import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

@Schema({
    timestamps: true,
    collection: 'inventory',
    toJSON: { virtuals: true, versionKey: false },
})
export class Inventory {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
    variantId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Warehouse', required: true })
    warehouseId: Types.ObjectId;

    @Prop({ required: true, default: 0 })
    quantity: number;

    @Prop({ default: 0 })
    reservedQuantity: number;

    @Prop()
    reorderPoint?: number;

    @Prop()
    maxStock?: number;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// product + variant + warehouse bileşik unique
InventorySchema.index(
    { productId: 1, variantId: 1, warehouseId: 1 },
    { unique: true },
);
InventorySchema.index({ warehouseId: 1 });
InventorySchema.index({ quantity: 1 }); // Kritik stok sorgulama
