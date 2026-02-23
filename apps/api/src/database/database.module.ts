import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

// ─── Şemalar ───
import {
    User, UserSchema,
    Customer, CustomerSchema,
    CustomerGroup, CustomerGroupSchema,
    Category, CategorySchema,
    Brand, BrandSchema,
    AttributeSet, AttributeSetSchema,
    Product, ProductSchema,
    ProductVariant, ProductVariantSchema,
    PriceList, PriceListSchema,
    CustomerPriceOverride, CustomerPriceOverrideSchema,
    Cart, CartSchema,
    Order, OrderSchema,
    OrderEvent, OrderEventSchema,
    Inventory, InventorySchema,
    Warehouse, WarehouseSchema,
    StockMovement, StockMovementSchema,
    Payment, PaymentSchema,
    Shipment, ShipmentSchema,
    Promotion, PromotionSchema,
    Coupon, CouponSchema,
    AuditLog, AuditLogSchema,
    ImportJob, ImportJobSchema,
    ImportJobError, ImportJobErrorSchema,
    WebhookEvent, WebhookEventSchema,
    SyncJob, SyncJobSchema,
    Setting, SettingSchema,
    FeatureFlag, FeatureFlagSchema,
} from './schemas';

const schemaRegistrations = MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Customer.name, schema: CustomerSchema },
    { name: CustomerGroup.name, schema: CustomerGroupSchema },
    { name: Category.name, schema: CategorySchema },
    { name: Brand.name, schema: BrandSchema },
    { name: AttributeSet.name, schema: AttributeSetSchema },
    { name: Product.name, schema: ProductSchema },
    { name: ProductVariant.name, schema: ProductVariantSchema },
    { name: PriceList.name, schema: PriceListSchema },
    { name: CustomerPriceOverride.name, schema: CustomerPriceOverrideSchema },
    { name: Cart.name, schema: CartSchema },
    { name: Order.name, schema: OrderSchema },
    { name: OrderEvent.name, schema: OrderEventSchema },
    { name: Inventory.name, schema: InventorySchema },
    { name: Warehouse.name, schema: WarehouseSchema },
    { name: StockMovement.name, schema: StockMovementSchema },
    { name: Payment.name, schema: PaymentSchema },
    { name: Shipment.name, schema: ShipmentSchema },
    { name: Promotion.name, schema: PromotionSchema },
    { name: Coupon.name, schema: CouponSchema },
    { name: AuditLog.name, schema: AuditLogSchema },
    { name: ImportJob.name, schema: ImportJobSchema },
    { name: ImportJobError.name, schema: ImportJobErrorSchema },
    { name: WebhookEvent.name, schema: WebhookEventSchema },
    { name: SyncJob.name, schema: SyncJobSchema },
    { name: Setting.name, schema: SettingSchema },
    { name: FeatureFlag.name, schema: FeatureFlagSchema },
]);

@Global()
@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/entec'),
                autoIndex: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            }),
            inject: [ConfigService],
        }),
        schemaRegistrations,
    ],
    exports: [schemaRegistrations],
})
export class DatabaseModule { }
