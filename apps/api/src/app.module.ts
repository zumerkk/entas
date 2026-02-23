import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { CatalogModule } from './catalog/catalog.module';
import { PricingModule } from './pricing/pricing.module';
import { OrdersModule } from './orders/orders.module';
import { ImportModule } from './import/import.module';
import { PromotionsModule } from './promotions/promotions.module';
import { SettingsModule } from './settings/settings.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { ReportsModule } from './reports/reports.module';
import { MediaModule } from './media/media.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
    imports: [
        // ─── Config ───
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '../../.env'],
        }),

        // ─── Rate Limiting ───
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 20,
            },
            {
                name: 'medium',
                ttl: 10000,
                limit: 100,
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 300,
            },
        ]),

        // ─── Core Modules ───
        DatabaseModule,
        AuditModule,
        AuthModule,

        // ─── Feature Modules ───
        CatalogModule,
        PricingModule,
        OrdersModule,
        ImportModule,
        PromotionsModule,
        SettingsModule,
        ShipmentsModule,
        WebhooksModule,
        ReportsModule,
        MediaModule,
        NotificationsModule,
        HealthModule,
    ],
    providers: [
        // Global JWT guard — tüm endpoint'ler korumalı, @Public() ile bypass
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        // Global RBAC guard — @Roles() ve @Permissions() dekoratörleri ile
        { provide: APP_GUARD, useClass: RolesGuard },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(RequestIdMiddleware).forRoutes('*');
    }
}
