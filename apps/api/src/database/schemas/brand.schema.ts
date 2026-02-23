import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BrandDocument = Brand & Document;

@Schema({
    timestamps: true,
    collection: 'brands',
    toJSON: { virtuals: true, versionKey: false },
})
export class Brand {
    @ApiProperty()
    @Prop({ required: true, trim: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    slug: string;

    @ApiProperty()
    @Prop()
    logo?: string;

    @ApiProperty()
    @Prop()
    description?: string;

    @ApiProperty()
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Prop({ default: 0 })
    sortOrder: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.index({ slug: 1 }, { unique: true });
BrandSchema.index({ isActive: 1, name: 1 });
