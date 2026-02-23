import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CategoryDocument = Category & Document;

@Schema({
    timestamps: true,
    collection: 'categories',
    toJSON: { virtuals: true, versionKey: false },
})
export class Category {
    @ApiProperty()
    @Prop({ required: true, trim: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'Category' })
    parentId?: Types.ObjectId;

    @ApiProperty()
    @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
    ancestors: Types.ObjectId[];

    @ApiProperty()
    @Prop({ default: 0 })
    depth: number;

    @ApiProperty()
    @Prop({ default: 0 })
    sortOrder: number;

    @ApiProperty()
    @Prop()
    image?: string;

    @ApiProperty()
    @Prop()
    description?: string;

    @ApiProperty()
    @Prop({ type: Object })
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
    };

    @ApiProperty()
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Prop({ default: 0 })
    productCount: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1, sortOrder: 1 });
CategorySchema.index({ ancestors: 1 });
CategorySchema.index({ isActive: 1 });
