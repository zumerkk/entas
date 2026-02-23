import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerPriceOverrideDocument = CustomerPriceOverride & Document;

@Schema({
    timestamps: true,
    collection: 'customerPriceOverrides',
    toJSON: { virtuals: true, versionKey: false },
})
export class CustomerPriceOverride {
    @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
    customerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop()
    discountPercent?: number;

    @Prop()
    validFrom?: Date;

    @Prop()
    validTo?: Date;

    @Prop()
    notes?: string;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    createdBy?: Types.ObjectId;

    @Prop({ default: true })
    isActive: boolean;
}

export const CustomerPriceOverrideSchema = SchemaFactory.createForClass(CustomerPriceOverride);

// customerId + productId bileşik unique indeks
CustomerPriceOverrideSchema.index(
    { customerId: 1, productId: 1 },
    { unique: true },
);
CustomerPriceOverrideSchema.index({ productId: 1 });
CustomerPriceOverrideSchema.index({ validFrom: 1, validTo: 1 });
