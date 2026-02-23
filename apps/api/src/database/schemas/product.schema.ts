import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

export class ProductImage {
    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    alt: string;

    @Prop({ default: 0 })
    sortOrder: number;

    @Prop({ default: false })
    isThumbnail: boolean;

    @Prop()
    thumbnailUrl?: string;
}

export class QuantityBreak {
    @Prop({ required: true })
    minQty: number;

    @Prop({ required: true })
    price: number;
}

@Schema({
    timestamps: true,
    collection: 'products',
    toJSON: { virtuals: true, versionKey: false },
})
export class Product {
    @ApiProperty()
    @Prop({ required: true, unique: true, trim: true, uppercase: true })
    sku: string;

    @ApiProperty()
    @Prop({ trim: true })
    barcode?: string;

    @ApiProperty()
    @Prop({ required: true, trim: true })
    title: string;

    @ApiProperty()
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    @ApiProperty()
    @Prop()
    shortDescription?: string;

    @ApiProperty()
    @Prop()
    description?: string;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'Brand' })
    brandId?: Types.ObjectId;

    @ApiProperty()
    @Prop({ type: [Types.ObjectId], ref: 'Category', index: true })
    categoryIds: Types.ObjectId[];

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'AttributeSet' })
    attributeSetId?: Types.ObjectId;

    @ApiProperty({ description: 'Baz fiyat (KDV hariç, TL)' })
    @Prop({ required: true, min: 0 })
    basePrice: number;

    @ApiProperty()
    @Prop({ default: 'TRY' })
    currency: string;

    @ApiProperty({ description: 'KDV oranı (%)' })
    @Prop({ default: 20 })
    vatRate: number;

    @ApiProperty()
    @Prop({ default: 'adet' })
    unit: string;

    @ApiProperty({ description: 'Koli/paket adedi (zorunluluk opsiyonel)' })
    @Prop()
    packSize?: number;

    @ApiProperty()
    @Prop({ default: 1, min: 1 })
    minOrderQuantity: number;

    @ApiProperty()
    @Prop({ type: [Object], default: [] })
    quantityBreaks: QuantityBreak[];

    @ApiProperty()
    @Prop({ type: Object, default: {} })
    attributes: Record<string, string | number | boolean>;

    @ApiProperty()
    @Prop({ type: [Object], default: [] })
    images: ProductImage[];

    @ApiProperty()
    @Prop({ type: [String], default: [] })
    documents: string[]; // teknik dökümanlar URL

    @ApiProperty()
    @Prop({ type: Object })
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
    };

    @ApiProperty()
    @Prop({ type: Object })
    dimensions?: {
        weight?: number;
        width?: number;
        height?: number;
        depth?: number;
    };

    @ApiProperty()
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Prop({ default: false })
    isFeatured: boolean;

    @ApiProperty()
    @Prop({ default: false })
    isNewArrival: boolean;

    @ApiProperty()
    @Prop({ type: [String], default: [] })
    tags: string[];

    @ApiProperty({ description: 'Fiyat gizleme (login olmadan görünmez)' })
    @Prop({ default: false })
    hidePriceForGuests: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// ─── İndeksler ───
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ barcode: 1 }, { sparse: true });
ProductSchema.index({ brandId: 1, isActive: 1 });
ProductSchema.index({ categoryIds: 1, isActive: 1 });
ProductSchema.index({ isActive: 1, isFeatured: 1 });
ProductSchema.index({ basePrice: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ title: 'text', tags: 'text', 'attributes.*': 'text' });
