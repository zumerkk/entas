import {
    Controller, Get, Post, Put, Delete,
    Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Promotions')
@Controller('promotions')
@ApiBearerAuth()
export class PromotionsController {
    constructor(private readonly promotionsService: PromotionsService) { }

    @Get()
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Promosyon listesi' })
    findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.promotionsService.findAllPromotions(page ? +page : 1, limit ? +limit : 20);
    }

    @Get(':id')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Promosyon detayı' })
    findById(@Param('id') id: string) {
        return this.promotionsService.findPromotionById(id);
    }

    @Post()
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Promosyon oluştur' })
    create(@Body() dto: any) {
        return this.promotionsService.createPromotion(dto);
    }

    @Put(':id')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Promosyon güncelle' })
    update(@Param('id') id: string, @Body() dto: any) {
        return this.promotionsService.updatePromotion(id, dto);
    }

    @Delete(':id')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Promosyon sil' })
    remove(@Param('id') id: string) {
        return this.promotionsService.removePromotion(id);
    }

    // ─── Kuponlar ───
    @Get('coupons/list')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Kupon listesi' })
    findAllCoupons(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.promotionsService.findAllCoupons(page ? +page : 1, limit ? +limit : 20);
    }

    @Post('coupons')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Kupon oluştur' })
    createCoupon(@Body() dto: any) {
        return this.promotionsService.createCoupon(dto);
    }

    @Public()
    @Post('coupons/validate')
    @ApiOperation({ summary: 'Kupon doğrula' })
    validateCoupon(@Body() body: { code: string; customerId?: string }) {
        return this.promotionsService.validateCoupon(body.code, body.customerId);
    }
}
