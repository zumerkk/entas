import { Module } from '@nestjs/common';
import { PricingModule } from '../pricing/pricing.module';
import { CartService } from './cart.service';
import { OrdersService } from './orders.service';
import { InventoryService } from './inventory.service';
import { CustomersService } from './customers.service';
import {
    CartController,
    OrdersController,
    CustomersController,
    InventoryController,
} from './orders.controller';

@Module({
    imports: [PricingModule],
    controllers: [
        CartController,
        OrdersController,
        CustomersController,
        InventoryController,
    ],
    providers: [
        CartService,
        OrdersService,
        InventoryService,
        CustomersService,
    ],
    exports: [CartService, OrdersService, InventoryService, CustomersService],
})
export class OrdersModule { }
