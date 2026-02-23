import { connect, connection } from 'mongoose';
import * as bcrypt from 'bcrypt';

/**
 * ENTEC Demo Seed Script
 *
 * Kullanım:
 *   npx ts-node src/database/seed.ts
 *
 * Ön koşul:
 *   - MongoDB çalışıyor olmalı (docker compose up -d)
 */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/entec';

async function seed() {
    console.log('🌱 ENTEC seed başlatılıyor...');
    console.log(`📦 MongoDB: ${MONGODB_URI}`);

    await connect(MONGODB_URI);
    const db = connection.db!;

    // ─── Koleksiyonları temizle ───
    const collections = [
        'users', 'customers', 'customerGroups', 'categories', 'brands',
        'attributeSets', 'products', 'productVariants', 'priceLists',
        'customerPriceOverrides', 'warehouses', 'inventory',
        'featureFlags', 'settings',
    ];

    for (const col of collections) {
        try {
            await db.collection(col).drop();
        } catch {
            // koleksiyon yoksa sorun değil
        }
    }

    // ─── 1. Feature Flags ───
    console.log('  ⚙️  Feature flags...');
    await db.collection('featureFlags').insertMany([
        { key: 'order_flow_mode', enabled: true, description: 'Sipariş akış modu: direct veya quote_approval', metadata: { mode: 'direct' }, createdAt: new Date(), updatedAt: new Date() },
        { key: 'hide_price_for_guests', enabled: false, description: 'Login olmadan fiyat gizleme', createdAt: new Date(), updatedAt: new Date() },
        { key: 'require_pack_quantity', enabled: false, description: 'Koli/paket zorunluluğu', createdAt: new Date(), updatedAt: new Date() },
        { key: 'enable_quantity_breaks', enabled: true, description: 'Miktar kırılımı fiyatlandırma', createdAt: new Date(), updatedAt: new Date() },
        { key: 'min_order_amount', enabled: false, description: 'Minimum sipariş tutarı (TL)', metadata: { amount: 500 }, createdAt: new Date(), updatedAt: new Date() },
    ]);

    // ─── 2. Settings ───
    console.log('  ⚙️  Settings...');
    await db.collection('settings').insertMany([
        { key: 'company_name', value: 'ENTAŞ Yapı Malzemeleri', type: 'string', description: 'Firma adı', createdAt: new Date(), updatedAt: new Date() },
        { key: 'default_currency', value: 'TRY', type: 'string', createdAt: new Date(), updatedAt: new Date() },
        { key: 'default_vat_rate', value: 20, type: 'number', createdAt: new Date(), updatedAt: new Date() },
        { key: 'default_payment_type', value: 'wire_transfer', type: 'string', createdAt: new Date(), updatedAt: new Date() },
    ]);

    // ─── 3. Admin kullanıcı ───
    console.log('  👤 Admin kullanıcı...');
    const passwordHash = await bcrypt.hash('Admin123!', 12);
    await db.collection('users').insertMany([
        {
            email: 'admin@entec.com.tr',
            passwordHash,
            firstName: 'Sistem',
            lastName: 'Admin',
            role: 'super_admin',
            permissions: ['*'],
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0,
            twoFactorEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            email: 'satis@entec.com.tr',
            passwordHash: await bcrypt.hash('Satis123!', 12),
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            role: 'sales_rep',
            permissions: ['customers:read', 'customers:update', 'orders:read', 'products:read'],
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0,
            twoFactorEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    // ─── 4. Depolar ───
    console.log('  🏭 Depolar...');
    const warehouses = await db.collection('warehouses').insertMany([
        { name: 'Ana Depo', code: 'WH-001', address: 'Organize Sanayi Bölgesi', city: 'İstanbul', isActive: true, isDefault: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Şube Depo', code: 'WH-002', address: 'Sanayi Cad.', city: 'Ankara', isActive: true, isDefault: false, createdAt: new Date(), updatedAt: new Date() },
    ]);
    const mainWarehouseId = warehouses.insertedIds[0];

    // ─── 5. Markalar ───
    console.log('  🏷️  Markalar...');
    const brands = await db.collection('brands').insertMany([
        { name: 'ENTEC Pro', slug: 'entec-pro', description: 'ENTAŞ profesyonel seri', isActive: true, sortOrder: 0, createdAt: new Date(), updatedAt: new Date() },
        { name: 'BoschPro', slug: 'boschpro', description: 'Bosch profesyonel alet', isActive: true, sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Makita', slug: 'makita', description: 'Makita elektrikli el aletleri', isActive: true, sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Weber', slug: 'weber', description: 'Weber yapı kimyasalları', isActive: true, sortOrder: 3, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Knauf', slug: 'knauf', description: 'Knauf alçı ve yalıtım', isActive: true, sortOrder: 4, createdAt: new Date(), updatedAt: new Date() },
    ]);

    // ─── 6. Kategoriler ───
    console.log('  📂 Kategoriler...');
    const cats = await db.collection('categories').insertMany([
        { name: 'El Aletleri', slug: 'el-aletleri', depth: 0, sortOrder: 0, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Elektrikli Aletler', slug: 'elektrikli-aletler', depth: 0, sortOrder: 1, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Yapı Kimyasalları', slug: 'yapi-kimyasallari', depth: 0, sortOrder: 2, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Boya & Vernik', slug: 'boya-vernik', depth: 0, sortOrder: 3, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Hırdavat', slug: 'hirdavat', depth: 0, sortOrder: 4, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Yalıtım', slug: 'yalitim', depth: 0, sortOrder: 5, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Tesisat', slug: 'tesisat', depth: 0, sortOrder: 6, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Elektrik', slug: 'elektrik', depth: 0, sortOrder: 7, isActive: true, productCount: 0, ancestors: [], createdAt: new Date(), updatedAt: new Date() },
    ]);

    // Alt kategoriler
    const elAletleriId = cats.insertedIds[0];
    const elektrikliId = cats.insertedIds[1];
    const yapiKimyaId = cats.insertedIds[2];

    const subCats = await db.collection('categories').insertMany([
        { name: 'Çekiçler', slug: 'cekicler', parentId: elAletleriId, ancestors: [elAletleriId], depth: 1, sortOrder: 0, isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Tornavidalar', slug: 'tornavidalar', parentId: elAletleriId, ancestors: [elAletleriId], depth: 1, sortOrder: 1, isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Matkap & Vidalama', slug: 'matkap-vidalama', parentId: elektrikliId, ancestors: [elektrikliId], depth: 1, sortOrder: 0, isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Taşlama', slug: 'taslama', parentId: elektrikliId, ancestors: [elektrikliId], depth: 1, sortOrder: 1, isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Derz & Yapıştırıcı', slug: 'derz-yapistirici', parentId: yapiKimyaId, ancestors: [yapiKimyaId], depth: 1, sortOrder: 0, isActive: true, productCount: 0, createdAt: new Date(), updatedAt: new Date() },
    ]);

    // ─── 7. Demo Ürünler (200 adet) ───
    console.log('  📦 200 demo ürün oluşturuluyor...');
    const brandIds = Object.values(brands.insertedIds);
    const catIds = [...Object.values(cats.insertedIds), ...Object.values(subCats.insertedIds)];

    const units = ['adet', 'paket', 'kutu', 'kg', 'metre', 'litre'];
    const products: any[] = [];
    const inventoryItems: any[] = [];

    for (let i = 1; i <= 200; i++) {
        const sku = `ENT-${String(i).padStart(5, '0')}`;
        const brandId = brandIds[i % brandIds.length];
        const categoryId = catIds[i % catIds.length];
        const price = Math.round((50 + Math.random() * 2000) * 100) / 100;

        products.push({
            sku,
            barcode: `869${String(1000000 + i)}`,
            title: `Demo Ürün ${i} — ${['Profesyonel', 'Standart', 'Ekonomik', 'Premium'][i % 4]} Seri`,
            slug: `demo-urun-${i}`,
            shortDescription: `Demo ürün açıklaması ${i}`,
            description: `Bu, ENTEC platformu için oluşturulmuş demo ürün #${i}. Gerçek üretim verisinde SKU, barkod, detaylı açıklama ve teknik özellikler bulunacaktır.`,
            brandId,
            categoryIds: [categoryId],
            basePrice: price,
            currency: 'TRY',
            vatRate: 20,
            unit: units[i % units.length],
            minOrderQuantity: i % 10 === 0 ? 5 : 1,
            packSize: i % 8 === 0 ? 12 : undefined,
            quantityBreaks: i % 5 === 0
                ? [
                    { minQty: 10, price: Math.round(price * 0.95 * 100) / 100 },
                    { minQty: 50, price: Math.round(price * 0.90 * 100) / 100 },
                    { minQty: 100, price: Math.round(price * 0.85 * 100) / 100 },
                ]
                : [],
            attributes: {
                renk: ['Kırmızı', 'Mavi', 'Siyah', 'Beyaz', 'Gri'][i % 5],
                malzeme: ['Çelik', 'Plastik', 'Ahşap', 'Alüminyum'][i % 4],
                agirlik: `${(0.1 + Math.random() * 10).toFixed(1)} kg`,
            },
            images: [{
                url: `https://placehold.co/600x400/1e3a8a/ffffff?text=ENT-${String(i).padStart(5, '0')}`,
                alt: `Demo Ürün ${i}`,
                sortOrder: 0,
                isThumbnail: true,
            }],
            documents: [],
            seo: {
                title: `Demo Ürün ${i} | ENTEC`,
                description: `Demo Ürün ${i} — En uygun fiyatlarla ENTEC'te.`,
            },
            tags: ['demo', i % 2 === 0 ? 'indirimli' : 'yeni'],
            isActive: true,
            isFeatured: i <= 10,
            isNewArrival: i > 190,
            hidePriceForGuests: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Stok kaydı
        inventoryItems.push({
            productId: null, // sonra güncellenecek
            warehouseId: mainWarehouseId,
            quantity: Math.floor(10 + Math.random() * 500),
            reservedQuantity: 0,
            reorderPoint: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    const insertedProducts = await db.collection('products').insertMany(products);

    // Stok kayıtlarını productId ile güncelle
    for (let i = 0; i < inventoryItems.length; i++) {
        inventoryItems[i].productId = insertedProducts.insertedIds[i];
    }
    await db.collection('inventory').insertMany(inventoryItems);

    // ─── 8. Müşteri Grubu + Müşteriler ───
    console.log('  🏢 Müşteri grubu ve müşteriler...');
    const groupResult = await db.collection('customerGroups').insertMany([
        { name: 'VIP Müşteriler', description: 'En yüksek iskonto grubu', discountPercent: 15, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        { name: 'Standart Müşteriler', description: 'Standart B2B müşteriler', discountPercent: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    ]);

    const vipGroupId = groupResult.insertedIds[0];
    const stdGroupId = groupResult.insertedIds[1];

    const customers = await db.collection('customers').insertMany([
        {
            companyName: 'ABC İnşaat A.Ş.',
            taxOffice: 'Kadıköy',
            taxNumber: '1234567890',
            accountCode: 'C-001',
            paymentType: 'deferred',
            creditLimit: 500000,
            openBalance: 125000,
            riskScore: 3,
            groupId: vipGroupId,
            deliveryAddresses: [
                { label: 'Şantiye 1', line1: 'Atatürk Cad. No:55', city: 'İstanbul', district: 'Kadıköy', country: 'TR', isDefault: true },
            ],
            branchAddresses: [],
            phone: '0216 555 1234',
            email: 'satin-alma@abcinsaat.com.tr',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            companyName: 'XYZ Yapı Market Ltd.',
            taxOffice: 'Çankaya',
            taxNumber: '9876543210',
            accountCode: 'C-002',
            paymentType: 'wire_transfer',
            creditLimit: 100000,
            openBalance: 0,
            riskScore: 5,
            groupId: stdGroupId,
            deliveryAddresses: [
                { label: 'Merkez', line1: 'Sanayi Sitesi B Blok', city: 'Ankara', district: 'Çankaya', country: 'TR', isDefault: true },
            ],
            branchAddresses: [],
            phone: '0312 444 5678',
            email: 'info@xyzyapi.com.tr',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    // Müşteri kullanıcıları
    const customer1Id = customers.insertedIds[0];
    const customer2Id = customers.insertedIds[1];

    await db.collection('users').insertMany([
        {
            email: 'alim@abcinsaat.com.tr',
            passwordHash: await bcrypt.hash('Musteri123!', 12),
            firstName: 'Mehmet',
            lastName: 'Kaya',
            role: 'customer_user',
            permissions: [],
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0,
            customerId: customer1Id,
            twoFactorEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            email: 'satinalma@xyzyapi.com.tr',
            passwordHash: await bcrypt.hash('Musteri123!', 12),
            firstName: 'Fatma',
            lastName: 'Demir',
            role: 'customer_user',
            permissions: [],
            isActive: true,
            isLocked: false,
            failedLoginAttempts: 0,
            customerId: customer2Id,
            twoFactorEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    // ─── 9. Fiyat Listesi ───
    console.log('  💰 Fiyat listesi...');
    const firstProducts = Object.values(insertedProducts.insertedIds).slice(0, 20);
    await db.collection('priceLists').insertOne({
        name: 'VIP Fiyat Listesi 2026',
        description: 'VIP müşteriler için özel fiyatlar',
        currency: 'TRY',
        priority: 10,
        items: firstProducts.map((pid, idx) => ({
            productId: pid,
            price: Math.round((40 + Math.random() * 1500) * 100) / 100,
        })),
        isActive: true,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    // ─── Özet ───
    console.log('\n✅ Seed tamamlandı!');
    console.log('  📊 Özet:');
    console.log(`     Kullanıcılar: ${await db.collection('users').countDocuments()}`);
    console.log(`     Müşteriler: ${await db.collection('customers').countDocuments()}`);
    console.log(`     Müşteri Grupları: ${await db.collection('customerGroups').countDocuments()}`);
    console.log(`     Kategoriler: ${await db.collection('categories').countDocuments()}`);
    console.log(`     Markalar: ${await db.collection('brands').countDocuments()}`);
    console.log(`     Ürünler: ${await db.collection('products').countDocuments()}`);
    console.log(`     Stok Kayıtları: ${await db.collection('inventory').countDocuments()}`);
    console.log(`     Depolar: ${await db.collection('warehouses').countDocuments()}`);
    console.log(`     Fiyat Listeleri: ${await db.collection('priceLists').countDocuments()}`);
    console.log(`     Feature Flags: ${await db.collection('featureFlags').countDocuments()}`);
    console.log(`     Ayarlar: ${await db.collection('settings').countDocuments()}`);
    console.log('\n  🔑 Demo Giriş:');
    console.log('     Admin: admin@entec.com.tr / Admin123!');
    console.log('     Satış: satis@entec.com.tr / Satis123!');
    console.log('     Müşteri: alim@abcinsaat.com.tr / Musteri123!');

    await connection.close();
    process.exit(0);
}

seed().catch((err) => {
    console.error('❌ Seed hatası:', err);
    process.exit(1);
});
