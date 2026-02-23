import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from './dto/catalog.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuditLogService } from '../audit/audit-log.service';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly auditLogService: AuditLogService,
    ) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Ürün listesi (filtre + pagination)' })
    findAll(@Query() filter: ProductFilterDto) {
        return this.productsService.findAll(filter);
    }

    @Public()
    @Get('slug/:slug')
    @ApiOperation({ summary: 'Ürün detayı (slug ile)' })
    findBySlug(@Param('slug') slug: string) {
        return this.productsService.findBySlug(slug);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Ürün detayı (ID ile)' })
    findById(@Param('id') id: string) {
        return this.productsService.findById(id);
    }

    @Post()
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Yeni ürün oluştur' })
    async create(
        @Body() dto: CreateProductDto,
        @CurrentUser() user: any,
        @Req() req: Request,
    ) {
        const product = await this.productsService.create(dto);

        await this.auditLogService.log({
            actorId: user.userId,
            actorRole: user.role,
            entityType: 'Product',
            entityId: (product as any)._id.toString(),
            action: 'create',
            after: { sku: dto.sku, title: dto.title, basePrice: dto.basePrice },
            requestId: (req.headers['x-request-id'] as string) || '',
        });

        return product;
    }

    @Put(':id')
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ürün güncelle' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateProductDto,
        @CurrentUser() user: any,
        @Req() req: Request,
    ) {
        const before = await this.productsService.findById(id);
        const product = await this.productsService.update(id, dto);

        await this.auditLogService.log({
            actorId: user.userId,
            actorRole: user.role,
            entityType: 'Product',
            entityId: id,
            action: 'update',
            before: before as any,
            after: dto as any,
            requestId: (req.headers['x-request-id'] as string) || '',
        });

        return product;
    }

    @Delete(':id')
    @Roles('super_admin', 'admin')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ürün sil' })
    async remove(
        @Param('id') id: string,
        @CurrentUser() user: any,
        @Req() req: Request,
    ) {
        const result = await this.productsService.remove(id);

        await this.auditLogService.log({
            actorId: user.userId,
            actorRole: user.role,
            entityType: 'Product',
            entityId: id,
            action: 'delete',
            requestId: (req.headers['x-request-id'] as string) || '',
        });

        return result;
    }
}
