import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductVariantDocument = ProductVariant & Document;

@Schema({
    timestamps: true,
    collection: 'productVariants',
    toJSON: { virtuals: true, versionKey: false },
})
export class ProductVariant {
    @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
    productId: Types.ObjectId;

    @Prop({ required: true, unique: true, trim: true, uppercase: true })
    sku: string;

    @Prop({ trim: true })
    barcode?: string;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ type: Object, default: {} })
    attributes: Record<string, string | number | boolean>;

    @Prop({ default: 0 })
    priceModifier: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

ProductVariantSchema.index({ sku: 1 }, { unique: true });
ProductVariantSchema.index({ productId: 1, isActive: 1 });
ProductVariantSchema.index({ barcode: 1 }, { sparse: true });
