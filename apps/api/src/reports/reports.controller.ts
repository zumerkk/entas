import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('reports')
@ApiBearerAuth()
@Roles('super_admin', 'admin', 'sales_rep')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Dashboard istatistikleri' })
    getDashboard() {
        return this.reportsService.getDashboard();
    }

    @Get('revenue')
    @ApiOperation({ summary: 'Gelir raporu' })
    @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly'] })
    @ApiQuery({ name: 'days', required: false, type: Number })
    getRevenue(
        @Query('period') period?: 'daily' | 'weekly' | 'monthly',
        @Query('days') days?: string,
    ) {
        return this.reportsService.getRevenueReport(period || 'daily', days ? +days : 30);
    }

    @Get('top-products')
    @ApiOperation({ summary: 'En çok satan ürünler' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getTopProducts(@Query('limit') limit?: string) {
        return this.reportsService.getTopProducts(limit ? +limit : 20);
    }

    @Get('top-customers')
    @ApiOperation({ summary: 'En çok sipariş veren müşteriler' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getTopCustomers(@Query('limit') limit?: string) {
        return this.reportsService.getTopCustomers(limit ? +limit : 20);
    }

    @Get('order-status')
    @ApiOperation({ summary: 'Sipariş durum dağılımı' })
    getOrderStatus() {
        return this.reportsService.getOrderStatusDistribution();
    }

    @Get('activity')
    @ApiOperation({ summary: 'Son aktiviteler (audit log)' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getActivity(@Query('limit') limit?: string) {
        return this.reportsService.getRecentActivity(limit ? +limit : 50);
    }
}
