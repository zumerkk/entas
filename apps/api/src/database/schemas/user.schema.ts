import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({
    timestamps: true,
    collection: 'users',
    toJSON: { virtuals: true, versionKey: false },
})
export class User {
    @ApiProperty()
    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @ApiProperty()
    @Prop({ required: true })
    passwordHash: string;

    @ApiProperty()
    @Prop({ required: true, trim: true })
    firstName: string;

    @ApiProperty()
    @Prop({ required: true, trim: true })
    lastName: string;

    @ApiProperty({ enum: ['super_admin', 'admin', 'sales_rep', 'customer_user'] })
    @Prop({
        required: true,
        enum: ['super_admin', 'admin', 'sales_rep', 'customer_user'],
        default: 'customer_user',
    })
    role: string;

    @ApiProperty()
    @Prop({ type: [String], default: [] })
    permissions: string[];

    @ApiProperty()
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Prop({ default: false })
    isLocked: boolean;

    @ApiProperty()
    @Prop({ default: 0 })
    failedLoginAttempts: number;

    @ApiProperty()
    @Prop()
    lastLoginAt?: Date;

    @ApiProperty()
    @Prop()
    lockedUntil?: Date;

    @ApiProperty()
    @Prop()
    refreshToken?: string;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'Customer' })
    customerId?: Types.ObjectId;

    @ApiProperty()
    @Prop()
    twoFactorSecret?: string;

    @ApiProperty()
    @Prop({ default: false })
    twoFactorEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ─── İndeksler ───
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ customerId: 1 }, { sparse: true });
UserSchema.index({ isLocked: 1, lockedUntil: 1 }, { sparse: true });
