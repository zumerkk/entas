/**
 * ENTAŞ B2B — Kapsamlı Seed Script (Koçtaş tarzı veriler)
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getModelToken } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require('bcryptjs');

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    console.log('🌱 ENTAŞ B2B — Kapsamlı seed başlıyor...\n');

    const UserModel = app.get(getModelToken('User'));
    const BrandModel = app.get(getModelToken('Brand'));
    const CategoryModel = app.get(getModelToken('Category'));
    const ProductModel = app.get(getModelToken('Product'));
    const CustomerModel = app.get(getModelToken('Customer'));
    const SettingModel = app.get(getModelToken('SystemSetting'));
    const FlagModel = app.get(getModelToken('FeatureFlag'));

    // ─── Users ───
    const users = [
        { email: 'admin@entas.com', firstName: 'Mehmet', lastName: 'Yılmaz', role: 'super_admin', password: 'Admin123!' },
        { email: 'satis@entas.com', firstName: 'Ayşe', lastName: 'Kaya', role: 'sales_rep', password: 'Satis123!' },
        { email: 'depo@entas.com', firstName: 'Ali', lastName: 'Demir', role: 'admin', password: 'Depo123!' },
        { email: 'demo@musteri.com', firstName: 'Hasan', lastName: 'Çelik', role: 'customer', password: 'Demo123!' },
    ];
    for (const u of users) {
        const exists = await UserModel.findOne({ email: u.email });
        if (!exists) {
            await UserModel.create({ email: u.email, passwordHash: await bcrypt.hash(u.password, 12), firstName: u.firstName, lastName: u.lastName, role: u.role, isActive: true, permissions: u.role === 'super_admin' ? ['*'] : [] });
        }
    }
    console.log(`✅ ${users.length} kullanıcı`);

    // ─── Brands ───
    const brands = [
        { name: 'Bosch', slug: 'bosch', website: 'https://bosch.com.tr' },
        { name: 'Schneider Electric', slug: 'schneider', website: 'https://se.com' },
        { name: 'Siemens', slug: 'siemens', website: 'https://siemens.com.tr' },
        { name: 'ABB', slug: 'abb', website: 'https://abb.com' },
        { name: 'Legrand', slug: 'legrand', website: 'https://legrand.com.tr' },
        { name: 'Makita', slug: 'makita', website: 'https://makita.com.tr' },
        { name: 'DeWalt', slug: 'dewalt', website: 'https://dewalt.com.tr' },
        { name: 'Viko', slug: 'viko', website: 'https://viko.com.tr' },
        { name: 'Klemsan', slug: 'klemsan', website: 'https://klemsan.com' },
        { name: 'Cimco', slug: 'cimco', website: 'https://cimco.de' },
    ];
    for (const b of brands) {
        await BrandModel.updateOne({ slug: b.slug }, { $setOnInsert: { ...b, isActive: true } }, { upsert: true });
    }
    console.log(`✅ ${brands.length} marka`);

    // ─── Categories ───
    const cats = [
        { name: 'Elektrik & Aydınlatma', slug: 'elektrik-aydinlatma', icon: '💡', sortOrder: 1 },
        { name: 'Hırdavat & El Aletleri', slug: 'hirdavat-el-aletleri', icon: '🔧', sortOrder: 2 },
        { name: 'Boya & Yapı Kimyasalları', slug: 'boya-yapi', icon: '🎨', sortOrder: 3 },
        { name: 'Tesisat & Sıhhi Tesisat', slug: 'tesisat', icon: '🚿', sortOrder: 4 },
        { name: 'İş Güvenliği', slug: 'is-guvenligi', icon: '🦺', sortOrder: 5 },
        { name: 'Otomasyon & Kontrol', slug: 'otomasyon-kontrol', icon: '⚙️', sortOrder: 6 },
        { name: 'Kablo & Aksesuar', slug: 'kablo-aksesuar', icon: '🔌', sortOrder: 7 },
        { name: 'Aydınlatma', slug: 'aydinlatma', icon: '🔦', sortOrder: 8 },
        { name: 'Isıtma & Soğutma', slug: 'isitma-sogutma', icon: '🌡️', sortOrder: 9 },
        { name: 'Bahçe & Dış Mekan', slug: 'bahce-dis-mekan', icon: '🌿', sortOrder: 10 },
        { name: 'Makine & Endüstriyel', slug: 'makine-endustriyel', icon: '🏭', sortOrder: 11 },
        { name: 'Mobilya & Dekorasyon', slug: 'mobilya-dekorasyon', icon: '🛋️', sortOrder: 12 },
    ];
    for (const c of cats) {
        await CategoryModel.updateOne({ slug: c.slug }, { $setOnInsert: { ...c, isActive: true, depth: 0, ancestors: [] } }, { upsert: true });
    }
    console.log(`✅ ${cats.length} kategori`);

    // ─── Products ───
    const allBrands = await BrandModel.find().lean();
    const allCats = await CategoryModel.find().lean();
    const brandMap = Object.fromEntries(allBrands.map((b: any) => [b.slug, b._id]));
    const catMap = Object.fromEntries(allCats.map((c: any) => [c.slug, c._id]));

    const products = [
        // Elektrik
        { sku: 'SCH-IC60-C16', title: 'Schneider iC60N C16 Otomatik Sigorta', brand: 'schneider', cat: 'elektrik-aydinlatma', basePrice: 85, oldPrice: 120, vatRate: 20, unit: 'adet', desc: 'DIN ray montajlı, 6kA kısa devre kapasiteli C tipi minyatür devre kesici', rating: 4.8, reviewCount: 142, freeShipping: true },
        { sku: 'SIE-5SL6-B16', title: 'Siemens 5SL6 B16 MCB Sigorta', brand: 'siemens', cat: 'elektrik-aydinlatma', basePrice: 65, oldPrice: 89, vatRate: 20, unit: 'adet', desc: 'B tipi, 16A, 1P, 6kA otomatik sigorta', rating: 4.7, reviewCount: 98, freeShipping: true },
        { sku: 'LGR-MOS-3M', title: 'Legrand Mosaic 3 Modül Çerçeve', brand: 'legrand', cat: 'elektrik-aydinlatma', basePrice: 42, oldPrice: 55, vatRate: 20, unit: 'adet', desc: 'Beyaz renk, yatay montaj, modern tasarım', rating: 4.5, reviewCount: 67 },
        { sku: 'VKO-KRE-2LI', title: 'Viko Karre Ikili Priz', brand: 'viko', cat: 'elektrik-aydinlatma', basePrice: 38, oldPrice: null, vatRate: 20, unit: 'adet', desc: 'Topraklı, çocuk korumalı, beyaz', rating: 4.3, reviewCount: 213 },
        { sku: 'SCH-ATV12-1K5', title: 'Schneider ATV12 Hız Kontrol Cihazı 1.5kW', brand: 'schneider', cat: 'elektrik-aydinlatma', basePrice: 4800, oldPrice: 5990, vatRate: 20, unit: 'adet', desc: '1.5kW, 220V, tek faz giriş, 3 faz çıkış inverter', rating: 4.9, reviewCount: 34, freeShipping: true },
        { sku: 'ABB-ACS580-7K5', title: 'ABB ACS580 Frekans Konvertör 7.5kW', brand: 'abb', cat: 'elektrik-aydinlatma', basePrice: 18900, oldPrice: 22500, vatRate: 20, unit: 'adet', desc: '7.5kW, 380V, 3 faz, IP21, dahili EMC filtreleri', rating: 4.8, reviewCount: 21, freeShipping: true },

        // Hırdavat & El Aletleri
        { sku: 'BSH-GSR-180', title: 'Bosch GSR 180-LI Akülü Matkap 18V', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 3250, oldPrice: 3990, vatRate: 20, unit: 'adet', desc: '18V, 2x2.0Ah akü, 54Nm tork, LED aydınlatma, çanta dahil', rating: 4.7, reviewCount: 328, freeShipping: true },
        { sku: 'BSH-GWS-750', title: 'Bosch GWS 750-125 Avuç Taşlama', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 2100, oldPrice: 2690, vatRate: 20, unit: 'adet', desc: '750W, 125mm disk, 11000rpm, yeniden başlatma koruması', rating: 4.6, reviewCount: 195, freeShipping: true },
        { sku: 'MKT-DHP-482', title: 'Makita DHP482 Akülü Darbeli Matkap', brand: 'makita', cat: 'hirdavat-el-aletleri', basePrice: 4590, oldPrice: 5200, vatRate: 20, unit: 'adet', desc: '18V LXT, 62Nm tork, 2 vitesli, metal dişli kutusu', rating: 4.9, reviewCount: 156, freeShipping: true },
        { sku: 'DWL-DCD-796', title: 'DeWalt DCD796 Kompakt Darbeli Matkap', brand: 'dewalt', cat: 'hirdavat-el-aletleri', basePrice: 5100, oldPrice: 5900, vatRate: 20, unit: 'adet', desc: '18V XR, fırçasız motor, 70Nm tork, kompakt tasarım', rating: 4.8, reviewCount: 89, freeShipping: true },
        { sku: 'BSH-GBH-240', title: 'Bosch GBH 240 Kırıcı Delici', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 3850, oldPrice: 4490, vatRate: 20, unit: 'adet', desc: '790W, 2.7J darbe enerjisi, SDS-Plus, vario-lock', rating: 4.5, reviewCount: 267 },
        { sku: 'CMC-TORX-SET', title: 'Cimco Torx Anahtar Seti 9 Parça', brand: 'cimco', cat: 'hirdavat-el-aletleri', basePrice: 189, oldPrice: 250, vatRate: 20, unit: 'set', desc: 'T10-T50, krom vanadyum çelik, top uçlu', rating: 4.4, reviewCount: 78 },
        { sku: 'BSH-GST-90E', title: 'Bosch GST 90 E Profesyonel Dekupaj', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 2450, oldPrice: null, vatRate: 20, unit: 'adet', desc: '650W, elektronik hız ayarı, SDS bıçak sistemi', rating: 4.6, reviewCount: 112 },

        // Boya & Yapı Kimyasalları
        { sku: 'BYA-INT-15L', title: 'İç Cephe Boyası Silinebilir Beyaz 15L', brand: 'bosch', cat: 'boya-yapi', basePrice: 680, oldPrice: 850, vatRate: 20, unit: 'kova', desc: 'Yüksek örtücülük, mat, silinebilir, kokusuz', rating: 4.3, reviewCount: 445 },
        { sku: 'BYA-DIS-20L', title: 'Dış Cephe Boyası Elastik 20L', brand: 'bosch', cat: 'boya-yapi', basePrice: 1250, oldPrice: 1490, vatRate: 20, unit: 'kova', desc: 'UV dayanımlı, elastik, su geçirmez, tüm dış yüzeyler için', rating: 4.5, reviewCount: 189, freeShipping: true },
        { sku: 'BYA-AST-5L', title: 'Astar Boya Konsantre 5L', brand: 'bosch', cat: 'boya-yapi', basePrice: 320, oldPrice: null, vatRate: 20, unit: 'bidon', desc: 'Konsantre formül, 1:3 sulandırma, tüm yüzeyler', rating: 4.2, reviewCount: 156 },
        { sku: 'YKM-SLK-25', title: 'Seramik Yapıştırıcı Süper Esnek 25kg', brand: 'bosch', cat: 'boya-yapi', basePrice: 165, oldPrice: 210, vatRate: 20, unit: 'torba', desc: 'C2TE S1 sınıf, ısıtmalı zemin uyumlu, iç-dış mekan', rating: 4.6, reviewCount: 234 },

        // Tesisat
        { sku: 'TST-PPR-20', title: 'PPR Boru 20mm PN20 (4m)', brand: 'bosch', cat: 'tesisat', basePrice: 28, oldPrice: 35, vatRate: 20, unit: 'adet', desc: '20mm çap, PN20 basınç sınıfı, sıcak-soğuk su', rating: 4.1, reviewCount: 342 },
        { sku: 'TST-PPR-25', title: 'PPR Boru 25mm PN20 (4m)', brand: 'bosch', cat: 'tesisat', basePrice: 42, oldPrice: null, vatRate: 20, unit: 'adet', desc: '25mm çap, PN20 basınç sınıfı', rating: 4.2, reviewCount: 278 },
        { sku: 'TST-FLEX-50', title: 'Flexiboru Paslanmaz 50cm', brand: 'bosch', cat: 'tesisat', basePrice: 65, oldPrice: 85, vatRate: 20, unit: 'adet', desc: 'Paslanmaz çelik örgülü, 1/2" bağlantı, batarya altı', rating: 4.4, reviewCount: 567 },
        { sku: 'TST-SIFON-ALT', title: 'Sifon Alttan Çıkışlı Krom', brand: 'bosch', cat: 'tesisat', basePrice: 95, oldPrice: null, vatRate: 20, unit: 'adet', desc: 'Krom kaplama, 1-1/4" giriş, 32mm çıkış, alttan', rating: 4.0, reviewCount: 189 },

        // İş Güvenliği
        { sku: 'IGV-BARET-01', title: 'İş Güvenliği Bareti CE EN397', brand: 'bosch', cat: 'is-guvenligi', basePrice: 120, oldPrice: 159, vatRate: 20, unit: 'adet', desc: 'ABS, 6 nokta süspansiyon, terletmez bantlı, beyaz', rating: 4.3, reviewCount: 423 },
        { sku: 'IGV-GOZLUK-01', title: 'Koruyucu Gözlük Anti-Fog UV', brand: 'bosch', cat: 'is-guvenligi', basePrice: 45, oldPrice: 65, vatRate: 20, unit: 'adet', desc: 'Polikarbonat lens, buğu önleyici, UV380 koruma', rating: 4.5, reviewCount: 567 },
        { sku: 'IGV-ELDVN-NBR', title: 'Nitril Eldiven Mavi (100lü)', brand: 'bosch', cat: 'is-guvenligi', basePrice: 89, oldPrice: null, vatRate: 20, unit: 'kutu', desc: 'Pudrasız, M/L/XL, kimyasala dayanıklı, tek kullanımlık', rating: 4.6, reviewCount: 891 },
        { sku: 'IGV-AYAK-S3', title: 'İş Ayakkabısı S3 SRC Kompozit', brand: 'bosch', cat: 'is-guvenligi', basePrice: 650, oldPrice: 890, vatRate: 20, unit: 'çift', desc: 'Kompozit burun, kevlar taban, anti-statik, su geçirmez', rating: 4.7, reviewCount: 234, freeShipping: true },

        // Otomasyon & Kontrol
        { sku: 'SIE-S7-1200', title: 'Siemens S7-1200 CPU 1214C PLC', brand: 'siemens', cat: 'otomasyon-kontrol', basePrice: 12500, oldPrice: 14990, vatRate: 20, unit: 'adet', desc: '14DI/10DO/2AI, Ethernet, 100KB bellek, DC/DC/DC', rating: 4.9, reviewCount: 56, freeShipping: true },
        { sku: 'SCH-TM221-24', title: 'Schneider TM221 PLC 24 I/O', brand: 'schneider', cat: 'otomasyon-kontrol', basePrice: 8900, oldPrice: 10500, vatRate: 20, unit: 'adet', desc: '24 I/O, Ethernet, Modbus, SoMachine Basic', rating: 4.7, reviewCount: 34, freeShipping: true },
        { sku: 'ABB-CP1-24', title: 'ABB CP-E 24/5.0 Güç Kaynağı', brand: 'abb', cat: 'otomasyon-kontrol', basePrice: 890, oldPrice: null, vatRate: 20, unit: 'adet', desc: '24VDC, 5A, 120W, DIN ray, kompakt', rating: 4.6, reviewCount: 123 },
        { sku: 'KLM-KLEMENS-16', title: 'Klemsan 16mm² Klemens Seti', brand: 'klemsan', cat: 'otomasyon-kontrol', basePrice: 12, oldPrice: 18, vatRate: 20, unit: 'adet', desc: 'DIN ray, vidalı bağlantı, gri, 76A', rating: 4.4, reviewCount: 456 },

        // Kablo & Aksesuar
        { sku: 'KBL-NYM-3X25', title: 'NYM 3x2.5mm² Kablo (100m)', brand: 'bosch', cat: 'kablo-aksesuar', basePrice: 1850, oldPrice: 2200, vatRate: 20, unit: 'rulo', desc: '3 damarlı, bakır iletken, PVC izoleli, iç tesisat', rating: 4.5, reviewCount: 178, freeShipping: true },
        { sku: 'KBL-NYA-6', title: 'NYA 6mm² Tek Damarlı Kablo (100m)', brand: 'bosch', cat: 'kablo-aksesuar', basePrice: 1250, oldPrice: null, vatRate: 20, unit: 'rulo', desc: 'Bakır iletken, PVC izoleli, tek damar, çeşitli renk', rating: 4.3, reviewCount: 234, freeShipping: true },
        { sku: 'KBL-SPIRAL-16', title: 'Spiral Kablo Kanalı 16mm (50m)', brand: 'bosch', cat: 'kablo-aksesuar', basePrice: 145, oldPrice: 180, vatRate: 20, unit: 'rulo', desc: 'PE, esnek, kablo düzenleme, siyah, -40°C/+100°C', rating: 4.1, reviewCount: 89 },

        // Aydınlatma
        { sku: 'AYD-LED-60', title: 'LED Panel 60x60 40W Beyaz', brand: 'bosch', cat: 'aydinlatma', basePrice: 320, oldPrice: 420, vatRate: 20, unit: 'adet', desc: '4000K, 4000lm, Ra>80, asma tavan montaj, 3 yıl garanti', rating: 4.4, reviewCount: 567 },
        { sku: 'AYD-PROJ-100', title: 'LED Projektör 100W IP65', brand: 'bosch', cat: 'aydinlatma', basePrice: 450, oldPrice: 590, vatRate: 20, unit: 'adet', desc: '6500K, 10000lm, IP65, alüminyum gövde, dış mekan', rating: 4.6, reviewCount: 345, freeShipping: true },
        { sku: 'AYD-ETANJ-36', title: 'Etanj Armatür LED 36W 120cm', brand: 'bosch', cat: 'aydinlatma', basePrice: 280, oldPrice: null, vatRate: 20, unit: 'adet', desc: 'IP65, 4000K, toz-su geçirmez, garaj/depo tipi', rating: 4.5, reviewCount: 234 },

        // Isıtma & Soğutma
        { sku: 'IST-KOMBI-24', title: 'Yoğuşmalı Kombi 24kW', brand: 'bosch', cat: 'isitma-sogutma', basePrice: 24500, oldPrice: 28900, vatRate: 20, unit: 'adet', desc: 'Yoğuşmalı, 24kW, dijital ekran, enerji sınıfı A', rating: 4.8, reviewCount: 89, freeShipping: true },
        { sku: 'IST-RADYATOR-600', title: 'Panel Radyatör 600x1200mm', brand: 'bosch', cat: 'isitma-sogutma', basePrice: 1850, oldPrice: 2100, vatRate: 20, unit: 'adet', desc: 'Tip 22, çift konvektörlü, beyaz, 2186 kcal/h', rating: 4.4, reviewCount: 234, freeShipping: true },
        { sku: 'IST-TERMOS-50', title: 'Elektrikli Termosifon 50L', brand: 'bosch', cat: 'isitma-sogutma', basePrice: 3200, oldPrice: 3890, vatRate: 20, unit: 'adet', desc: '50 litre, emaye kaplı, termostat, enerji tasarruflu', rating: 4.3, reviewCount: 178, freeShipping: true },

        // Bahçe & Dış Mekan
        { sku: 'BHC-CIMEN-BICAK', title: 'Çim Biçme Makinesi Elektrikli 1600W', brand: 'bosch', cat: 'bahce-dis-mekan', basePrice: 4200, oldPrice: 5100, vatRate: 20, unit: 'adet', desc: '1600W, 38cm kesim, 45L toplama, 5 kademe yükseklik', rating: 4.5, reviewCount: 123, freeShipping: true },
        { sku: 'BHC-YIKAMA-135', title: 'Yüksek Basınçlı Yıkama 135bar', brand: 'bosch', cat: 'bahce-dis-mekan', basePrice: 3800, oldPrice: 4500, vatRate: 20, unit: 'adet', desc: '135bar, 420l/h, hortum makarası, köpük tabancası dahil', rating: 4.7, reviewCount: 267, freeShipping: true },

        // Makine & Endüstriyel
        { sku: 'MKN-KOMPRESOR-50', title: 'Kompresör 50L Yağsız Sessiz', brand: 'bosch', cat: 'makine-endustriyel', basePrice: 6500, oldPrice: 7900, vatRate: 20, unit: 'adet', desc: '50L, 8bar, 200l/dk, yağsız, 65dB sessiz çalışma', rating: 4.6, reviewCount: 89, freeShipping: true },
        { sku: 'MKN-KAYNAK-200A', title: 'Inverter Kaynak Makinesi 200A', brand: 'bosch', cat: 'makine-endustriyel', basePrice: 4800, oldPrice: 5900, vatRate: 20, unit: 'adet', desc: 'IGBT teknoloji, 200A, MMA/TIG, Hot Start, Arc Force', rating: 4.7, reviewCount: 156, freeShipping: true },
        { sku: 'MKN-SURUKLU-TEZG', title: 'Tezgah Tipi Matkap 16mm', brand: 'bosch', cat: 'makine-endustriyel', basePrice: 5200, oldPrice: null, vatRate: 20, unit: 'adet', desc: '16mm delme kapasitesi, 12 devir, döküm gövde', rating: 4.4, reviewCount: 67, freeShipping: true },

        // Mobilya & Dekorasyon
        { sku: 'MBL-RAF-5KAT', title: 'Metal Depo Rafı 5 Katlı 180x90x40', brand: 'bosch', cat: 'mobilya-dekorasyon', basePrice: 890, oldPrice: 1100, vatRate: 20, unit: 'adet', desc: 'Galvaniz, 175kg/raf, vidasız montaj, 5 katlı', rating: 4.5, reviewCount: 456 },
        { sku: 'MBL-CALIS-TEZG', title: 'Çalışma Tezgahı Ahşap 150x60', brand: 'bosch', cat: 'mobilya-dekorasyon', basePrice: 3200, oldPrice: 3900, vatRate: 20, unit: 'adet', desc: 'Masif ahşap tabla, çelik ayaklar, mengene yuvası', rating: 4.6, reviewCount: 123, freeShipping: true },
    ];

    for (const p of products) {
        const slug = p.title.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/-+/g, '-');
        await ProductModel.updateOne(
            { sku: p.sku },
            {
                $setOnInsert: {
                    sku: p.sku, title: p.title, slug, description: p.desc,
                    basePrice: p.basePrice, oldPrice: p.oldPrice || null,
                    vatRate: p.vatRate, unit: p.unit,
                    isActive: true, freeShipping: p.freeShipping || false,
                    rating: p.rating || 0, reviewCount: p.reviewCount || 0,
                    brandId: brandMap[p.brand],
                    categoryIds: [catMap[p.cat]].filter(Boolean),
                },
            },
            { upsert: true },
        );
    }
    console.log(`✅ ${products.length} ürün`);

    // ─── B2B Müşteriler ───
    const customers = [
        { companyName: 'Anadolu Elektrik Ltd. Şti.', accountCode: 'MUS-001', taxNumber: '1234567890', taxOffice: 'Ankara Kurumlar', city: 'Ankara', phone: '0312 234 56 78', email: 'info@anadoluelektrik.com' },
        { companyName: 'İstanbul Tesisat A.Ş.', accountCode: 'MUS-002', taxNumber: '9876543210', taxOffice: 'Kadıköy', city: 'İstanbul', phone: '0216 345 67 89', email: 'satin@istanbultesisat.com' },
        { companyName: 'Ege Otomasyon Sanayi', accountCode: 'MUS-003', taxNumber: '5678901234', taxOffice: 'Bornova', city: 'İzmir', phone: '0232 456 78 90', email: 'info@egeotomasyon.com' },
        { companyName: 'Karadeniz Yapı Market', accountCode: 'MUS-004', taxNumber: '3456789012', taxOffice: 'Trabzon Merkez', city: 'Trabzon', phone: '0462 567 89 01', email: 'siparis@karadenizyapi.com' },
        { companyName: 'Akdeniz Endüstri Malzemeleri', accountCode: 'MUS-005', taxNumber: '7890123456', taxOffice: 'Muratpaşa', city: 'Antalya', phone: '0242 678 90 12', email: 'bilgi@akdeniz-endustri.com' },
    ];
    for (const c of customers) {
        await CustomerModel.updateOne({ accountCode: c.accountCode }, { $setOnInsert: { ...c, isActive: true } }, { upsert: true });
    }
    console.log(`✅ ${customers.length} B2B müşteri`);

    // ─── Settings & Flags ───
    const settings = [
        { key: 'company.name', value: 'ENTAŞ', type: 'string' },
        { key: 'company.slogan', value: 'Endüstriyel Ürünlerde Güvenilir Tedarik Ortağınız', type: 'string' },
        { key: 'company.phone', value: '0212 123 45 67', type: 'string' },
        { key: 'company.email', value: 'info@entas.com', type: 'string' },
        { key: 'order.minAmount', value: 200, type: 'number' },
        { key: 'shipping.freeThreshold', value: 500, type: 'number' },
    ];
    for (const s of settings) await SettingModel.updateOne({ key: s.key }, { $setOnInsert: s }, { upsert: true });

    const flags = [
        { key: 'b2b.quotation_mode', enabled: true, description: 'Teklif modu' },
        { key: 'catalog.atlas_search', enabled: true, description: 'Atlas Search' },
        { key: 'notifications.email', enabled: true, description: 'E-posta bildirimleri' },
    ];
    for (const f of flags) await FlagModel.updateOne({ key: f.key }, { $setOnInsert: f }, { upsert: true });

    console.log(`\n🎉 Seed tamamlandı!`);
    console.log('─────────────────────────────────');
    console.log('👤 Admin:    admin@entas.com / Admin123!');
    console.log('👤 Satış:    satis@entas.com / Satis123!');
    console.log('👤 Müşteri:  demo@musteri.com / Demo123!');
    console.log(`📦 ${products.length} ürün, ${cats.length} kategori, ${brands.length} marka`);
    console.log(`🏢 ${customers.length} B2B müşteri`);
    console.log('─────────────────────────────────\n');

    await app.close();
}

seed().catch((err) => { console.error('Seed hatası:', err); process.exit(1); });
