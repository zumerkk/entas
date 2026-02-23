import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AttributeSetDocument = AttributeSet & Document;

export class AttributeDefinition {
    @Prop({ required: true })
    key: string;

    @Prop({ required: true })
    label: string;

    @Prop({ enum: ['text', 'number', 'boolean', 'select', 'multi_select'], default: 'text' })
    type: string;

    @Prop({ type: [String], default: [] })
    options: string[];

    @Prop()
    unit?: string;

    @Prop({ default: false })
    isRequired: boolean;

    @Prop({ default: false })
    isFilterable: boolean;

    @Prop({ default: false })
    isSearchable: boolean;

    @Prop({ default: 0 })
    sortOrder: number;
}

@Schema({
    timestamps: true,
    collection: 'attributeSets',
    toJSON: { virtuals: true, versionKey: false },
})
export class AttributeSet {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ type: [Object], default: [] })
    attributes: AttributeDefinition[];

    @Prop({ default: true })
    isActive: boolean;
}

export const AttributeSetSchema = SchemaFactory.createForClass(AttributeSet);

AttributeSetSchema.index({ name: 1 }, { unique: true });
