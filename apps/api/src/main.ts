import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // ─── CORS ───
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3002',
            process.env.WEB_URL,
            process.env.ADMIN_URL,
        ].filter(Boolean) as string[],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // ─── Global Prefix ───
    app.setGlobalPrefix('api');

    // ─── Swagger API Docs ───
    const config = new DocumentBuilder()
        .setTitle('ENTAŞ B2B API')
        .setDescription(`
B2B endüstriyel ürünler e-ticaret platformu API dokümantasyonu.

## Kimlik Doğrulama
Tüm endpoint'ler JWT token gerektirir (\`@Public()\` hariç).

\`\`\`
Authorization: Bearer <access_token>
\`\`\`

## Roller
- \`super_admin\` — Tüm yetkiler
- \`admin\` — Yönetim paneli
- \`sales_rep\` — Satış temsilcisi
- \`customer\` — B2B müşteri
        `)
        .setVersion('1.0')
        .setContact('ENTAŞ', 'https://entas.com', 'api@entas.com')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT Access Token',
        })
        .addTag('Auth', 'Kimlik doğrulama ve yetkilendirme')
        .addTag('Products', 'Ürün yönetimi')
        .addTag('Categories', 'Kategori yönetimi')
        .addTag('Brands', 'Marka yönetimi')
        .addTag('Search', 'Ürün arama ve öneri')
        .addTag('Pricing', 'Fiyatlandırma motoru')
        .addTag('Cart', 'Sepet yönetimi')
        .addTag('Orders', 'Sipariş yönetimi')
        .addTag('Customers', 'Müşteri yönetimi')
        .addTag('Inventory', 'Stok yönetimi')
        .addTag('Import', 'Toplu veri yükleme')
        .addTag('Promotions', 'Promosyon ve kupon')
        .addTag('Settings', 'Sistem ayarları')
        .addTag('Shipments', 'Sevkiyat ve kargo')
        .addTag('Webhooks', 'Webhook event yönetimi')
        .addTag('Reports', 'Raporlar ve dashboard')
        .addTag('Media', 'Dosya yükleme')
        .addTag('Notifications', 'Bildirim yönetimi')
        .addTag('Health', 'Sağlık kontrolü')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
        customSiteTitle: 'ENTAŞ B2B API Docs',
        customfavIcon: 'https://nestjs.com/img/logo_text.svg',
        customCss: `
            .swagger-ui .topbar { background: #1e1b4b; }
            .swagger-ui .topbar .topbar-wrapper img { content: url(''); }
            .swagger-ui .info .title { color: #4f46e5; }
        `,
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'method',
        },
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`
╔════════════════════════════════════════════╗
║  ENTAŞ B2B API                            ║
║  Port: ${port}                               ║
║  Swagger: http://localhost:${port}/docs       ║
║  Health:  http://localhost:${port}/api/health  ║
╚════════════════════════════════════════════╝
    `);
}

bootstrap();
