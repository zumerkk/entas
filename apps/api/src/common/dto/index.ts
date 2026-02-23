import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty() shippingAddress: any;
    @ApiPropertyOptional() billingAddress?: any;
    @ApiProperty({ enum: ['transfer', 'credit_card', 'on_delivery', 'credit'] })
    paymentMethod: string;
    @ApiPropertyOptional() notes?: string;
    @ApiPropertyOptional() couponCode?: string;
    @ApiPropertyOptional() idempotencyKey?: string;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] })
    status: string;
    @ApiPropertyOptional() internalNotes?: string;
}

export class CreateShipmentDto {
    @ApiProperty() orderId: string;
    @ApiProperty() carrier: string;
    @ApiPropertyOptional() trackingNumber?: string;
    @ApiPropertyOptional() estimatedDelivery?: Date;
}

export class UpdateShipmentStatusDto {
    @ApiProperty({ enum: ['preparing', 'shipped', 'in_transit', 'delivered', 'returned'] })
    status: string;
    @ApiPropertyOptional() notes?: string;
}

export class CreatePromotionDto {
    @ApiProperty() name: string;
    @ApiProperty({ enum: ['percentage', 'fixed', 'free_shipping'] }) type: string;
    @ApiProperty() value: number;
    @ApiPropertyOptional() startDate?: Date;
    @ApiPropertyOptional() endDate?: Date;
    @ApiPropertyOptional() minOrderAmount?: number;
    @ApiPropertyOptional() applicableProducts?: string[];
}

export class ValidateCouponDto {
    @ApiProperty() code: string;
}

export class CreateCustomerDto {
    @ApiProperty() companyName: string;
    @ApiProperty() accountCode: string;
    @ApiPropertyOptional() taxNumber?: string;
    @ApiPropertyOptional() taxOffice?: string;
    @ApiPropertyOptional() phone?: string;
    @ApiPropertyOptional() email?: string;
    @ApiPropertyOptional() city?: string;
    @ApiPropertyOptional() district?: string;
    @ApiPropertyOptional() address?: string;
    @ApiPropertyOptional() groupId?: string;
}

export class UpsertSettingDto {
    @ApiProperty() value: any;
    @ApiPropertyOptional() type?: string;
    @ApiPropertyOptional() description?: string;
}

export class ToggleFeatureFlagDto {
    @ApiProperty() enabled: boolean;
}

export class CartItemDto {
    @ApiProperty() productId: string;
    @ApiProperty() quantity: number;
}

export class UpdateCartItemDto {
    @ApiProperty() quantity: number;
}

export class StartImportDto {
    @ApiProperty({ enum: ['product', 'stock'] }) type: string;
}

export class SendNotificationDto {
    @ApiProperty() channel: string;
    @ApiProperty() templateKey: string;
    @ApiProperty() to: string;
    @ApiPropertyOptional() data?: Record<string, any>;
}

export class RegisterWebhookDto {
    @ApiProperty() url: string;
    @ApiPropertyOptional() secret?: string;
    @ApiPropertyOptional() events?: string[];
}

export class DispatchWebhookDto {
    @ApiProperty() event: string;
    @ApiProperty() payload: any;
}
