import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PricingService, PriceRequest } from './pricing.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Pricing')
@Controller('pricing')
export class PricingController {
    constructor(private readonly pricingService: PricingService) { }

    @Get('product/:productId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tek ürün fiyatı (müşteriye özel)' })
    @ApiQuery({ name: 'quantity', required: false, type: Number })
    async getProductPrice(
        @Param('productId') productId: string,
        @Query('quantity') quantity?: string,
        @CurrentUser() user?: any,
    ) {
        return this.pricingService.calculatePrice({
            productId,
            quantity: quantity ? parseInt(quantity, 10) : 1,
            customerId: user?.customerId,
        });
    }

    @Post('bulk')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Toplu fiyat hesaplama' })
    async getBulkPrices(
        @Body() body: { items: { productId: string; quantity: number }[] },
        @CurrentUser() user?: any,
    ) {
        return this.pricingService.calculateBulkPrices(
            body.items,
            user?.customerId,
        );
    }

    @Post('cart-total')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sepet toplamı hesapla' })
    async getCartTotal(
        @Body() body: { items: { productId: string; quantity: number }[] },
        @CurrentUser() user?: any,
    ) {
        return this.pricingService.calculateCartTotal(
            body.items,
            user?.customerId,
        );
    }

    @Public()
    @Get('product/:productId/guest')
    @ApiOperation({ summary: 'Misafir fiyatı (baz fiyat)' })
    @ApiQuery({ name: 'quantity', required: false, type: Number })
    async getGuestPrice(
        @Param('productId') productId: string,
        @Query('quantity') quantity?: string,
    ) {
        return this.pricingService.calculatePrice({
            productId,
            quantity: quantity ? parseInt(quantity, 10) : 1,
        });
    }
}
