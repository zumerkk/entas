import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerGroupDocument = CustomerGroup & Document;

@Schema({
    timestamps: true,
    collection: 'customerGroups',
    toJSON: { virtuals: true, versionKey: false },
})
export class CustomerGroup {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'PriceList' })
    priceListId?: Types.ObjectId;

    @Prop({ default: 0 })
    discountPercent: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const CustomerGroupSchema = SchemaFactory.createForClass(CustomerGroup);

CustomerGroupSchema.index({ name: 1 }, { unique: true });
CustomerGroupSchema.index({ priceListId: 1 });
