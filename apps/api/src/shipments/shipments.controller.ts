import {
    Controller, Get, Post, Put,
    Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { ShipmentsService, CreateShipmentDto } from './shipments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Shipments')
@Controller('shipments')
@ApiBearerAuth()
export class ShipmentsController {
    constructor(private readonly shipmentsService: ShipmentsService) { }

    @Post()
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Sevkiyat oluştur' })
    create(@Body() dto: CreateShipmentDto, @CurrentUser('userId') userId: string) {
        return this.shipmentsService.create(dto, userId);
    }

    @Get()
    @Roles('super_admin', 'admin', 'sales_rep')
    @ApiOperation({ summary: 'Sevkiyat listesi' })
    findAll(
        @Query('page') page?: string, @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.shipmentsService.findAll(page ? +page : 1, limit ? +limit : 20, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Sevkiyat detayı' })
    findById(@Param('id') id: string) {
        return this.shipmentsService.findById(id);
    }

    @Get('order/:orderId')
    @ApiOperation({ summary: 'Sipariş sevkiyatları' })
    findByOrder(@Param('orderId') orderId: string) {
        return this.shipmentsService.findByOrder(orderId);
    }

    @Put(':id/status')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Sevkiyat durumu güncelle' })
    updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string; trackingNumber?: string; trackingUrl?: string },
    ) {
        return this.shipmentsService.updateStatus(id, body.status, body.trackingNumber, body.trackingUrl);
    }

    @Public()
    @Get('track/:trackingNumber')
    @ApiOperation({ summary: 'Kargo takip (public)' })
    track(@Param('trackingNumber') trackingNumber: string) {
        return this.shipmentsService.trackShipment(trackingNumber);
    }
}
