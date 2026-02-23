import {
    Controller, Get, Post, Put, Delete,
    Body, Param, Query, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { CartService } from './cart.service';
import { OrdersService, CheckoutDto } from './orders.service';
import { InventoryService } from './inventory.service';
import { CustomersService } from './customers.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AuditLogService } from '../audit/audit-log.service';

// ─── Cart Controller ───
@ApiTags('Cart')
@Controller('cart')
@ApiBearerAuth()
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @ApiOperation({ summary: 'Sepeti getir' })
    getCart(@CurrentUser('userId') userId: string) {
        return this.cartService.getCart(userId);
    }

    @Get('summary')
    @ApiOperation({ summary: 'Sepet özeti (fiyatlarla)' })
    getSummary(
        @CurrentUser('userId') userId: string,
        @CurrentUser('customerId') customerId?: string,
    ) {
        return this.cartService.getCartSummary(userId, customerId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Sepete ürün ekle' })
    addItem(
        @CurrentUser('userId') userId: string,
        @Body() body: { productId: string; quantity: number; variantId?: string; note?: string },
    ) {
        return this.cartService.addItem(userId, body.productId, body.quantity, body.variantId, body.note);
    }

    @Put('items/:productId')
    @ApiOperation({ summary: 'Ürün miktarını güncelle' })
    updateQuantity(
        @CurrentUser('userId') userId: string,
        @Param('productId') productId: string,
        @Body() body: { quantity: number },
    ) {
        return this.cartService.updateItemQuantity(userId, productId, body.quantity);
    }

    @Delete('items/:productId')
    @ApiOperation({ summary: 'Sepetten ürün kaldır' })
    removeItem(
        @CurrentUser('userId') userId: string,
        @Param('productId') productId: string,
    ) {
        return this.cartService.removeItem(userId, productId);
    }

    @Delete()
    @ApiOperation({ summary: 'Sepeti temizle' })
    clearCart(@CurrentUser('userId') userId: string) {
        return this.cartService.clearCart(userId);
    }

    @Post('coupon')
    @ApiOperation({ summary: 'Kupon uygula' })
    applyCoupon(
        @CurrentUser('userId') userId: string,
        @Body() body: { couponCode: string },
    ) {
        return this.cartService.applyCoupon(userId, body.couponCode);
    }
}

// ─── Orders Controller ───
@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth()
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly auditLogService: AuditLogService,
    ) { }

    @Post('checkout')
    @ApiOperation({ summary: 'Sepetten sipariş oluştur (checkout)' })
    async checkout(
        @CurrentUser() user: any,
        @Body() dto: CheckoutDto,
        @Req() req: Request,
    ) {
        const requestId = (req.headers['x-request-id'] as string) || '';
        const order = await this.ordersService.checkout(
            user.userId, user.customerId, dto, requestId,
        );

        await this.auditLogService.log({
            actorId: user.userId,
            actorRole: user.role,
            entityType: 'Order',
            entityId: (order as any)._id.toString(),
            action: 'create',
            after: { orderNumber: (order as any).orderNumber, grandTotal: (order as any).grandTotal },
            requestId,
        });

        return order;
    }

    @Get()
    @ApiOperation({ summary: 'Siparişlerim' })
    @ApiQuery({ name: 'page', required: false }) @ApiQuery({ name: 'limit', required: false })
    findMy(
        @CurrentUser('customerId') customerId: string,
        @Query('page') page?: string, @Query('limit') limit?: string,
    ) {
        return this.ordersService.findByCustomer(
            customerId, page ? +page : 1, limit ? +limit : 20,
        );
    }

    @Get('admin')
    @Roles('super_admin', 'admin', 'sales_rep')
    @ApiOperation({ summary: 'Tüm siparişler (admin)' })
    findAll(
        @Query('page') page?: string, @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.ordersService.findAll(
            page ? +page : 1, limit ? +limit : 20, status,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Sipariş detayı' })
    findById(@Param('id') id: string) {
        return this.ordersService.findById(id);
    }

    @Put(':id/status')
    @Roles('super_admin', 'admin', 'sales_rep')
    @ApiOperation({ summary: 'Sipariş durumu güncelle' })
    async updateStatus(
        @Param('id') id: string,
        @Body() body: { status: string; internalNotes?: string; cancelReason?: string },
        @CurrentUser() user: any,
        @Req() req: Request,
    ) {
        const requestId = (req.headers['x-request-id'] as string) || '';
        return this.ordersService.updateStatus(
            id, body.status, user.userId, requestId, body.internalNotes, body.cancelReason,
        );
    }

    @Post(':id/reorder')
    @ApiOperation({ summary: 'Yeniden sipariş (sepete kopyala)' })
    reorder(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.ordersService.reorder(id, userId);
    }
}

// ─── Customers Controller ───
@ApiTags('Customers')
@Controller('customers')
@ApiBearerAuth()
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    @Roles('super_admin', 'admin', 'sales_rep')
    @ApiOperation({ summary: 'Müşteri listesi' })
    findAll(
        @Query('page') page?: string, @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.customersService.findAll(
            page ? +page : 1, limit ? +limit : 20, search,
        );
    }

    @Get('groups')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Müşteri grupları' })
    findAllGroups() {
        return this.customersService.findAllGroups();
    }

    @Get(':id')
    @Roles('super_admin', 'admin', 'sales_rep')
    @ApiOperation({ summary: 'Müşteri detayı' })
    findById(@Param('id') id: string) {
        return this.customersService.findById(id);
    }

    @Post()
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Müşteri oluştur' })
    create(@Body() dto: any) {
        return this.customersService.create(dto);
    }

    @Put(':id')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Müşteri güncelle' })
    update(@Param('id') id: string, @Body() dto: any) {
        return this.customersService.update(id, dto);
    }

    @Delete(':id')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Müşteri sil' })
    remove(@Param('id') id: string) {
        return this.customersService.remove(id);
    }
}

// ─── Inventory Controller ───
@ApiTags('Inventory')
@Controller('inventory')
@ApiBearerAuth()
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Get('product/:productId')
    @Roles('super_admin', 'admin', 'sales_rep')
    @ApiOperation({ summary: 'Ürün stok bilgisi' })
    getProductStock(@Param('productId') productId: string) {
        return this.inventoryService.getProductStock(productId);
    }

    @Post('product/:productId/add')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Stok girişi' })
    addStock(
        @Param('productId') productId: string,
        @Body() body: { warehouseId: string; quantity: number; reason: string; variantId?: string },
        @CurrentUser('userId') userId: string,
        @Req() req: Request,
    ) {
        const requestId = (req.headers['x-request-id'] as string) || '';
        return this.inventoryService.addStock(
            productId, body.warehouseId, body.quantity, body.reason, userId, requestId, body.variantId,
        );
    }

    @Post('product/:productId/remove')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Stok çıkışı' })
    removeStock(
        @Param('productId') productId: string,
        @Body() body: { warehouseId: string; quantity: number; reason: string },
        @CurrentUser('userId') userId: string,
        @Req() req: Request,
    ) {
        const requestId = (req.headers['x-request-id'] as string) || '';
        return this.inventoryService.removeStock(
            productId, body.warehouseId, body.quantity, body.reason, userId, requestId,
        );
    }

    @Get('product/:productId/movements')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Stok hareketleri' })
    getMovements(
        @Param('productId') productId: string,
        @Query('page') page?: string, @Query('limit') limit?: string,
    ) {
        return this.inventoryService.getMovements(productId, page ? +page : 1, limit ? +limit : 50);
    }

    @Get('alerts')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Kritik stok uyarıları' })
    getLowStockAlerts() {
        return this.inventoryService.getLowStockAlerts();
    }

    @Get('warehouses')
    @Roles('super_admin', 'admin')
    @ApiOperation({ summary: 'Depo listesi' })
    getWarehouses() {
        return this.inventoryService.getWarehouses();
    }
}
