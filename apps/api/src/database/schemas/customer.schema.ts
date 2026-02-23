import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CustomerDocument = Customer & Document;

// ─── Alt Şemalar ───
export class CustomerAddress {
    @Prop({ required: true })
    label: string;

    @Prop({ required: true })
    line1: string;

    @Prop()
    line2?: string;

    @Prop({ required: true })
    city: string;

    @Prop({ required: true })
    district: string;

    @Prop()
    postalCode?: string;

    @Prop({ default: 'TR' })
    country: string;

    @Prop({ default: false })
    isDefault: boolean;
}

@Schema({
    timestamps: true,
    collection: 'customers',
    toJSON: { virtuals: true, versionKey: false },
})
export class Customer {
    @ApiProperty()
    @Prop({ required: true, trim: true })
    companyName: string;

    @ApiProperty()
    @Prop({ trim: true })
    taxOffice?: string;

    @ApiProperty()
    @Prop({ trim: true })
    taxNumber?: string;

    @ApiProperty({ description: 'ERP cari kodu' })
    @Prop({ trim: true, sparse: true })
    accountCode?: string;

    @ApiProperty({ enum: ['wire_transfer', 'credit_card', 'deferred'] })
    @Prop({
        required: true,
        enum: ['wire_transfer', 'credit_card', 'deferred'],
        default: 'wire_transfer',
    })
    paymentType: string;

    @ApiProperty({ description: 'Kredi limiti (TL)' })
    @Prop({ default: 0 })
    creditLimit: number;

    @ApiProperty({ description: 'Açık bakiye (TL)' })
    @Prop({ default: 0 })
    openBalance: number;

    @ApiProperty({ description: 'Risk notu (1-10)' })
    @Prop({ min: 1, max: 10 })
    riskScore?: number;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'User' })
    salesRepId?: Types.ObjectId;

    @ApiProperty()
    @Prop({ type: Types.ObjectId, ref: 'CustomerGroup' })
    groupId?: Types.ObjectId;

    @ApiProperty()
    @Prop({ type: [Object], default: [] })
    deliveryAddresses: CustomerAddress[];

    @ApiProperty()
    @Prop({ type: [Object], default: [] })
    branchAddresses: CustomerAddress[];

    @ApiProperty()
    @Prop()
    phone?: string;

    @ApiProperty()
    @Prop()
    email?: string;

    @ApiProperty()
    @Prop()
    notes?: string;

    @ApiProperty()
    @Prop({ default: true })
    isActive: boolean;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// ─── İndeksler ───
CustomerSchema.index({ companyName: 'text' });
CustomerSchema.index({ accountCode: 1 }, { unique: true, sparse: true });
CustomerSchema.index({ groupId: 1 });
CustomerSchema.index({ salesRepId: 1 });
CustomerSchema.index({ isActive: 1, companyName: 1 });
CustomerSchema.index({ taxNumber: 1 }, { sparse: true });
