import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema({
    timestamps: true,
    collection: 'promotions',
    toJSON: { virtuals: true, versionKey: false },
})
export class Promotion {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop()
    description?: string;

    @Prop({ required: true, enum: ['percentage', 'fixed_amount', 'buy_x_get_y', 'free_shipping'] })
    type: string;

    @Prop({ required: true })
    value: number;

    @Prop()
    minOrderAmount?: number;

    @Prop({ type: [Types.ObjectId], ref: 'Category' })
    applicableCategories?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Brand' })
    applicableBrands?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Product' })
    applicableProducts?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'CustomerGroup' })
    applicableGroups?: Types.ObjectId[];

    @Prop()
    validFrom?: Date;

    @Prop()
    validTo?: Date;

    @Prop()
    maxUsageCount?: number;

    @Prop({ default: 0 })
    currentUsageCount: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);

PromotionSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });
PromotionSchema.index({ type: 1 });

// ─── Coupon ───
export type CouponDocument = Coupon & Document;

@Schema({
    timestamps: true,
    collection: 'coupons',
    toJSON: { virtuals: true, versionKey: false },
})
export class Coupon {
    @Prop({ required: true, unique: true, uppercase: true, trim: true })
    code: string;

    @Prop({ type: Types.ObjectId, ref: 'Promotion', required: true })
    promotionId: Types.ObjectId;

    @Prop()
    maxUses?: number;

    @Prop({ default: 0 })
    usedCount: number;

    @Prop()
    expiresAt?: Date;

    @Prop({ default: true })
    isActive: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ promotionId: 1 });
CouponSchema.index({ isActive: 1, expiresAt: 1 });
