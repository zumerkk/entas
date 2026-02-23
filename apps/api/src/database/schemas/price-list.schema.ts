import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PriceListDocument = PriceList & Document;

export class PriceListItem {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    price: number;

    @Prop()
    minQty?: number;

    @Prop()
    maxQty?: number;
}

@Schema({
    timestamps: true,
    collection: 'priceLists',
    toJSON: { virtuals: true, versionKey: false },
})
export class PriceList {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ default: 'TRY' })
    currency: string;

    @Prop()
    validFrom?: Date;

    @Prop()
    validTo?: Date;

    @Prop({ default: 0 })
    priority: number;

    @Prop({ type: [Object], default: [] })
    items: PriceListItem[];

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ enum: ['draft', 'pending_approval', 'approved', 'rejected'], default: 'approved' })
    status: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    approvedBy?: Types.ObjectId;

    @Prop()
    approvedAt?: Date;
}

export const PriceListSchema = SchemaFactory.createForClass(PriceList);

PriceListSchema.index({ name: 1 }, { unique: true });
PriceListSchema.index({ isActive: 1, priority: -1 });
PriceListSchema.index({ 'items.productId': 1 });
PriceListSchema.index({ status: 1 });
PriceListSchema.index({ validFrom: 1, validTo: 1 });
