import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WarehouseDocument = Warehouse & Document;

@Schema({
    timestamps: true,
    collection: 'warehouses',
    toJSON: { virtuals: true, versionKey: false },
})
export class Warehouse {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, unique: true, trim: true })
    code: string;

    @Prop()
    address?: string;

    @Prop()
    city?: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isDefault: boolean;
}

export const WarehouseSchema = SchemaFactory.createForClass(Warehouse);

WarehouseSchema.index({ code: 1 }, { unique: true });
WarehouseSchema.index({ isActive: 1 });
