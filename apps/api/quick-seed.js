const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function seed() {
    await mongoose.connect('mongodb://localhost:27017/entec_b2b');
    const db = mongoose.connection.db;
    console.log('MongoDB bağlandı');

    // Admin user
    const hash = await bcrypt.hash('Admin123!', 10);
    const demoHash = await bcrypt.hash('Demo123!', 10);
    await db.collection('users').updateOne({ email: 'admin@entas.com' }, { $setOnInsert: { email: 'admin@entas.com', passwordHash: hash, firstName: 'Mehmet', lastName: 'Yılmaz', role: 'super_admin', isActive: true, permissions: ['*'], createdAt: new Date() } }, { upsert: true });
    await db.collection('users').updateOne({ email: 'demo@musteri.com' }, { $setOnInsert: { email: 'demo@musteri.com', passwordHash: demoHash, firstName: 'Hasan', lastName: 'Çelik', role: 'customer', isActive: true, permissions: [], createdAt: new Date() } }, { upsert: true });
    console.log('✅ Kullanıcılar');

    // Brands
    const brands = ['Bosch', 'Schneider Electric', 'Siemens', 'ABB', 'Legrand', 'Makita', 'DeWalt', 'Viko', 'Klemsan', 'Cimco'];
    for (const name of brands) {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        await db.collection('brands').updateOne({ slug }, { $setOnInsert: { name, slug, isActive: true, createdAt: new Date() } }, { upsert: true });
    }
    console.log('✅ 10 marka');

    // Categories
    const cats = [
        { name: 'Elektrik & Aydınlatma', slug: 'elektrik-aydinlatma', icon: '💡' },
        { name: 'Hırdavat & El Aletleri', slug: 'hirdavat-el-aletleri', icon: '🔧' },
        { name: 'Boya & Yapı Kimyasalları', slug: 'boya-yapi', icon: '🎨' },
        { name: 'Tesisat & Sıhhi Tesisat', slug: 'tesisat', icon: '🚿' },
        { name: 'İş Güvenliği', slug: 'is-guvenligi', icon: '🦺' },
        { name: 'Otomasyon & Kontrol', slug: 'otomasyon-kontrol', icon: '⚙️' },
        { name: 'Kablo & Aksesuar', slug: 'kablo-aksesuar', icon: '🔌' },
        { name: 'Aydınlatma', slug: 'aydinlatma', icon: '🔦' },
        { name: 'Isıtma & Soğutma', slug: 'isitma-sogutma', icon: '🌡️' },
        { name: 'Bahçe & Dış Mekan', slug: 'bahce-dis-mekan', icon: '🌿' },
        { name: 'Makine & Endüstriyel', slug: 'makine-endustriyel', icon: '🏭' },
        { name: 'Mobilya & Dekorasyon', slug: 'mobilya-dekorasyon', icon: '🛋️' },
    ];
    for (const c of cats) {
        await db.collection('categories').updateOne({ slug: c.slug }, { $setOnInsert: { ...c, isActive: true, depth: 0, ancestors: [], sortOrder: 0, createdAt: new Date() } }, { upsert: true });
    }
    console.log('✅ 12 kategori');

    // Get IDs
    const allBrands = await db.collection('brands').find().toArray();
    const allCats = await db.collection('categories').find().toArray();
    const bm = {}; allBrands.forEach(b => bm[b.slug] = b._id);
    const cm = {}; allCats.forEach(c => cm[c.slug] = c._id);

    // Products
    const prods = [
        { sku: 'SCH-IC60-C16', title: 'Schneider iC60N C16 Otomatik Sigorta', brand: 'schneider-electric', cat: 'elektrik-aydinlatma', basePrice: 85, oldPrice: 120, vatRate: 20, unit: 'adet', desc: 'DIN ray montajlı, 6kA kısa devre kapasiteli C tipi minyatür devre kesici', rating: 4.8, reviewCount: 142, freeShipping: true },
        { sku: 'SIE-5SL6-B16', title: 'Siemens 5SL6 B16 MCB Sigorta', brand: 'siemens', cat: 'elektrik-aydinlatma', basePrice: 65, oldPrice: 89, vatRate: 20, unit: 'adet', desc: 'B tipi, 16A, 1P, 6kA', rating: 4.7, reviewCount: 98, freeShipping: true },
        { sku: 'LGR-MOS-3M', title: 'Legrand Mosaic 3 Modül Çerçeve', brand: 'legrand', cat: 'elektrik-aydinlatma', basePrice: 42, oldPrice: 55, vatRate: 20, unit: 'adet', desc: 'Beyaz renk, yatay montaj', rating: 4.5, reviewCount: 67 },
        { sku: 'VKO-KRE-2LI', title: 'Viko Karre İkili Priz Topraklı', brand: 'viko', cat: 'elektrik-aydinlatma', basePrice: 38, oldPrice: null, vatRate: 20, unit: 'adet', desc: 'Çocuk korumalı, beyaz', rating: 4.3, reviewCount: 213 },
        { sku: 'SCH-ATV12', title: 'Schneider ATV12 Hız Kontrol Cihazı 1.5kW', brand: 'schneider-electric', cat: 'elektrik-aydinlatma', basePrice: 4800, oldPrice: 5990, vatRate: 20, unit: 'adet', desc: '1.5kW, 220V tek faz giriş inverter', rating: 4.9, reviewCount: 34, freeShipping: true },
        { sku: 'ABB-ACS580', title: 'ABB ACS580 Frekans Konvertör 7.5kW', brand: 'abb', cat: 'elektrik-aydinlatma', basePrice: 18900, oldPrice: 22500, vatRate: 20, unit: 'adet', desc: '7.5kW, 380V, 3 faz, IP21', rating: 4.8, reviewCount: 21, freeShipping: true },
        { sku: 'BSH-GSR180', title: 'Bosch GSR 180-LI Akülü Matkap 18V', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 3250, oldPrice: 3990, vatRate: 20, unit: 'adet', desc: '18V, 2x2.0Ah akü, 54Nm tork, LED aydınlatma', rating: 4.7, reviewCount: 328, freeShipping: true },
        { sku: 'BSH-GWS750', title: 'Bosch GWS 750-125 Avuç Taşlama', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 2100, oldPrice: 2690, vatRate: 20, unit: 'adet', desc: '750W, 125mm disk, 11000rpm', rating: 4.6, reviewCount: 195, freeShipping: true },
        { sku: 'MKT-DHP482', title: 'Makita DHP482 Akülü Darbeli Matkap', brand: 'makita', cat: 'hirdavat-el-aletleri', basePrice: 4590, oldPrice: 5200, vatRate: 20, unit: 'adet', desc: '18V LXT, 62Nm tork, metal dişli kutusu', rating: 4.9, reviewCount: 156, freeShipping: true },
        { sku: 'DWL-DCD796', title: 'DeWalt DCD796 Kompakt Darbeli Matkap', brand: 'dewalt', cat: 'hirdavat-el-aletleri', basePrice: 5100, oldPrice: 5900, vatRate: 20, unit: 'adet', desc: '18V XR, fırçasız motor, 70Nm tork', rating: 4.8, reviewCount: 89, freeShipping: true },
        { sku: 'BSH-GBH240', title: 'Bosch GBH 240 Kırıcı Delici', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 3850, oldPrice: 4490, vatRate: 20, unit: 'adet', desc: '790W, 2.7J darbe enerjisi, SDS-Plus', rating: 4.5, reviewCount: 267 },
        { sku: 'CMC-TORX', title: 'Cimco Torx Anahtar Seti 9 Parça', brand: 'cimco', cat: 'hirdavat-el-aletleri', basePrice: 189, oldPrice: 250, vatRate: 20, unit: 'set', desc: 'T10-T50, krom vanadyum çelik, ball end', rating: 4.4, reviewCount: 78 },
        { sku: 'BSH-GST90E', title: 'Bosch GST 90 E Profesyonel Dekupaj', brand: 'bosch', cat: 'hirdavat-el-aletleri', basePrice: 2450, oldPrice: null, vatRate: 20, unit: 'adet', desc: '650W, elektronik hız ayarı, SDS bıçak', rating: 4.6, reviewCount: 112 },
        { sku: 'BYA-INT15L', title: 'İç Cephe Boyası Silinebilir Beyaz 15L', brand: 'bosch', cat: 'boya-yapi', basePrice: 680, oldPrice: 850, vatRate: 20, unit: 'kova', desc: 'Yüksek örtücülük, mat, silinebilir, kokusuz', rating: 4.3, reviewCount: 445 },
        { sku: 'BYA-DIS20L', title: 'Dış Cephe Boyası Elastik 20L', brand: 'bosch', cat: 'boya-yapi', basePrice: 1250, oldPrice: 1490, vatRate: 20, unit: 'kova', desc: 'UV dayanımlı, elastik, su geçirmez', rating: 4.5, reviewCount: 189, freeShipping: true },
        { sku: 'YKM-SLK25', title: 'Seramik Yapıştırıcı Süper Esnek 25kg', brand: 'bosch', cat: 'boya-yapi', basePrice: 165, oldPrice: 210, vatRate: 20, unit: 'torba', desc: 'C2TE S1 sınıf, ısıtmalı zemin uyumlu', rating: 4.6, reviewCount: 234 },
        { sku: 'TST-PPR20', title: 'PPR Boru 20mm PN20 (4m)', brand: 'bosch', cat: 'tesisat', basePrice: 28, oldPrice: 35, vatRate: 20, unit: 'adet', desc: 'Sıcak-soğuk su, PN20 basınç sınıfı', rating: 4.1, reviewCount: 342 },
        { sku: 'TST-FLEX50', title: 'Flexiboru Paslanmaz 50cm', brand: 'bosch', cat: 'tesisat', basePrice: 65, oldPrice: 85, vatRate: 20, unit: 'adet', desc: 'Paslanmaz çelik örgülü, 1/2" bağlantı', rating: 4.4, reviewCount: 567 },
        { sku: 'TST-SIFON', title: 'Sifon Alttan Çıkışlı Krom', brand: 'bosch', cat: 'tesisat', basePrice: 95, oldPrice: null, vatRate: 20, unit: 'adet', desc: 'Krom kaplama, 1-1/4" giriş', rating: 4.0, reviewCount: 189 },
        { sku: 'IGV-BARET', title: 'İş Güvenliği Bareti CE EN397', brand: 'bosch', cat: 'is-guvenligi', basePrice: 120, oldPrice: 159, vatRate: 20, unit: 'adet', desc: 'ABS, 6 nokta süspansiyon, terletmez bant', rating: 4.3, reviewCount: 423 },
        { sku: 'IGV-GOZLUK', title: 'Koruyucu Gözlük Anti-Fog UV', brand: 'bosch', cat: 'is-guvenligi', basePrice: 45, oldPrice: 65, vatRate: 20, unit: 'adet', desc: 'Polikarbonat lens, buğu önleyici, UV380', rating: 4.5, reviewCount: 567 },
        { sku: 'IGV-ELDVN', title: 'Nitril Eldiven Mavi (100lü)', brand: 'bosch', cat: 'is-guvenligi', basePrice: 89, oldPrice: null, vatRate: 20, unit: 'kutu', desc: 'Pudrasız, kimyasala dayanıklı, tek kullanım', rating: 4.6, reviewCount: 891 },
        { sku: 'IGV-AYAK', title: 'İş Ayakkabısı S3 SRC Kompozit Burun', brand: 'bosch', cat: 'is-guvenligi', basePrice: 650, oldPrice: 890, vatRate: 20, unit: 'çift', desc: 'Kompozit burun, kevlar taban, su geçirmez', rating: 4.7, reviewCount: 234, freeShipping: true },
        { sku: 'SIE-S71200', title: 'Siemens S7-1200 CPU 1214C PLC', brand: 'siemens', cat: 'otomasyon-kontrol', basePrice: 12500, oldPrice: 14990, vatRate: 20, unit: 'adet', desc: '14DI/10DO/2AI, Ethernet, 100KB bellek', rating: 4.9, reviewCount: 56, freeShipping: true },
        { sku: 'SCH-TM221', title: 'Schneider TM221 PLC 24 I/O', brand: 'schneider-electric', cat: 'otomasyon-kontrol', basePrice: 8900, oldPrice: 10500, vatRate: 20, unit: 'adet', desc: '24 I/O, Ethernet, Modbus, SoMachine', rating: 4.7, reviewCount: 34, freeShipping: true },
        { sku: 'ABB-CPE24', title: 'ABB CP-E 24/5.0 Güç Kaynağı', brand: 'abb', cat: 'otomasyon-kontrol', basePrice: 890, oldPrice: null, vatRate: 20, unit: 'adet', desc: '24VDC, 5A, 120W, DIN ray, kompakt', rating: 4.6, reviewCount: 123 },
        { sku: 'KLM-16', title: 'Klemsan 16mm² Ray Klemens Seti', brand: 'klemsan', cat: 'otomasyon-kontrol', basePrice: 12, oldPrice: 18, vatRate: 20, unit: 'adet', desc: 'DIN ray, vidalı bağlantı, gri, 76A', rating: 4.4, reviewCount: 456 },
        { sku: 'KBL-NYM3X25', title: 'NYM 3x2.5mm² Kablo (100m)', brand: 'bosch', cat: 'kablo-aksesuar', basePrice: 1850, oldPrice: 2200, vatRate: 20, unit: 'rulo', desc: '3 damarlı, bakır iletken, PVC izoleli', rating: 4.5, reviewCount: 178, freeShipping: true },
        { sku: 'KBL-NYA6', title: 'NYA 6mm² Tek Damarlı Kablo (100m)', brand: 'bosch', cat: 'kablo-aksesuar', basePrice: 1250, oldPrice: null, vatRate: 20, unit: 'rulo', desc: 'Bakır iletken, PVC izoleli, tek damar', rating: 4.3, reviewCount: 234, freeShipping: true },
        { sku: 'AYD-LED60', title: 'LED Panel 60x60 40W Gün Işığı', brand: 'bosch', cat: 'aydinlatma', basePrice: 320, oldPrice: 420, vatRate: 20, unit: 'adet', desc: '4000K, 4000lm, Ra>80, asma tavan montaj', rating: 4.4, reviewCount: 567 },
        { sku: 'AYD-PROJ100', title: 'LED Projektör 100W IP65 Beyaz', brand: 'bosch', cat: 'aydinlatma', basePrice: 450, oldPrice: 590, vatRate: 20, unit: 'adet', desc: '6500K, 10000lm, IP65, alüminyum gövde', rating: 4.6, reviewCount: 345, freeShipping: true },
        { sku: 'AYD-ETANJ36', title: 'Etanj Armatür LED 36W 120cm IP65', brand: 'bosch', cat: 'aydinlatma', basePrice: 280, oldPrice: null, vatRate: 20, unit: 'adet', desc: 'IP65, 4000K, toz-su geçirmez, garaj tipi', rating: 4.5, reviewCount: 234 },
        { sku: 'IST-KOMBI24', title: 'Yoğuşmalı Kombi 24kW Dijital', brand: 'bosch', cat: 'isitma-sogutma', basePrice: 24500, oldPrice: 28900, vatRate: 20, unit: 'adet', desc: 'Yoğuşmalı, dijital ekran, enerji A sınıfı', rating: 4.8, reviewCount: 89, freeShipping: true },
        { sku: 'IST-RAD600', title: 'Panel Radyatör 600x1200mm Tip 22', brand: 'bosch', cat: 'isitma-sogutma', basePrice: 1850, oldPrice: 2100, vatRate: 20, unit: 'adet', desc: 'Çift konvektörlü, beyaz, 2186 kcal/h', rating: 4.4, reviewCount: 234, freeShipping: true },
        { sku: 'IST-TERMO50', title: 'Elektrikli Termosifon 50L Emaye', brand: 'bosch', cat: 'isitma-sogutma', basePrice: 3200, oldPrice: 3890, vatRate: 20, unit: 'adet', desc: '50 litre, emaye kaplı, enerji tasarruflu', rating: 4.3, reviewCount: 178, freeShipping: true },
        { sku: 'BHC-CIMEN', title: 'Çim Biçme Makinesi Elektrikli 1600W', brand: 'bosch', cat: 'bahce-dis-mekan', basePrice: 4200, oldPrice: 5100, vatRate: 20, unit: 'adet', desc: '38cm kesim genişliği, 45L toplama sepeti', rating: 4.5, reviewCount: 123, freeShipping: true },
        { sku: 'BHC-YIKAMA', title: 'Yüksek Basınçlı Yıkama Makinesi 135bar', brand: 'bosch', cat: 'bahce-dis-mekan', basePrice: 3800, oldPrice: 4500, vatRate: 20, unit: 'adet', desc: '135bar, 420l/h, hortum makarası, köpük tabancası', rating: 4.7, reviewCount: 267, freeShipping: true },
        { sku: 'MKN-KOMP50', title: 'Kompresör 50L Yağsız Sessiz', brand: 'bosch', cat: 'makine-endustriyel', basePrice: 6500, oldPrice: 7900, vatRate: 20, unit: 'adet', desc: '50L, 8bar, 200l/dk, yağsız, 65dB sessiz', rating: 4.6, reviewCount: 89, freeShipping: true },
        { sku: 'MKN-KAYNAK200', title: 'Inverter Kaynak Makinesi 200A', brand: 'bosch', cat: 'makine-endustriyel', basePrice: 4800, oldPrice: 5900, vatRate: 20, unit: 'adet', desc: 'IGBT teknoloji, MMA/TIG, Hot Start', rating: 4.7, reviewCount: 156, freeShipping: true },
        { sku: 'MKN-TEZGAH16', title: 'Tezgah Tipi Sütunlu Matkap 16mm', brand: 'bosch', cat: 'makine-endustriyel', basePrice: 5200, oldPrice: null, vatRate: 20, unit: 'adet', desc: '16mm delme, 12 devir, döküm gövde', rating: 4.4, reviewCount: 67, freeShipping: true },
        { sku: 'MBL-RAF5K', title: 'Metal Depo Rafı 5 Katlı 180x90x40', brand: 'bosch', cat: 'mobilya-dekorasyon', basePrice: 890, oldPrice: 1100, vatRate: 20, unit: 'adet', desc: 'Galvaniz, 175kg/raf, vidasız montaj', rating: 4.5, reviewCount: 456 },
        { sku: 'MBL-CALTEZ', title: 'Çalışma Tezgahı Masif Ahşap 150x60', brand: 'bosch', cat: 'mobilya-dekorasyon', basePrice: 3200, oldPrice: 3900, vatRate: 20, unit: 'adet', desc: 'Masif ahşap tabla, çelik ayaklar, mengene yuvası', rating: 4.6, reviewCount: 123, freeShipping: true },
    ];

    for (const p of prods) {
        const slug = p.title.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-').replace(/-+/g, '-');
        await db.collection('products').updateOne({ sku: p.sku }, { $setOnInsert: { ...p, slug, isActive: true, brandId: bm[p.brand] || null, categoryIds: [cm[p.cat]].filter(Boolean), createdAt: new Date(), updatedAt: new Date() } }, { upsert: true });
    }
    console.log('✅ ' + prods.length + ' ürün');

    // B2B Customers
    const custs = [
        { companyName: 'Anadolu Elektrik Ltd. Şti.', accountCode: 'MUS-001', taxNumber: '1234567890', taxOffice: 'Ankara Kurumlar', city: 'Ankara', district: 'Çankaya', phone: '0312 234 56 78', email: 'info@anadoluelektrik.com' },
        { companyName: 'İstanbul Tesisat A.Ş.', accountCode: 'MUS-002', taxNumber: '9876543210', taxOffice: 'Kadıköy', city: 'İstanbul', district: 'Kadıköy', phone: '0216 345 67 89', email: 'satin@istanbultesisat.com' },
        { companyName: 'Ege Otomasyon Sanayi', accountCode: 'MUS-003', taxNumber: '5678901234', taxOffice: 'Bornova', city: 'İzmir', district: 'Bornova', phone: '0232 456 78 90', email: 'info@egeotomasyon.com' },
        { companyName: 'Karadeniz Yapı Market', accountCode: 'MUS-004', taxNumber: '3456789012', taxOffice: 'Trabzon Merkez', city: 'Trabzon', district: 'Ortahisar', phone: '0462 567 89 01', email: 'siparis@karadenizyapi.com' },
        { companyName: 'Akdeniz Endüstri Malzemeleri', accountCode: 'MUS-005', taxNumber: '7890123456', taxOffice: 'Muratpaşa', city: 'Antalya', district: 'Kepez', phone: '0242 678 90 12', email: 'bilgi@akdeniz-endustri.com' },
    ];
    for (const c of custs) {
        await db.collection('customers').updateOne({ accountCode: c.accountCode }, { $setOnInsert: { ...c, isActive: true, createdAt: new Date() } }, { upsert: true });
    }
    console.log('✅ 5 B2B müşteri');

    // Settings
    for (const s of [
        { key: 'company.name', value: 'ENTAŞ', type: 'string' },
        { key: 'company.slogan', value: 'Endüstriyel Ürünlerde Güvenilir Tedarik Ortağınız', type: 'string' },
        { key: 'company.phone', value: '0212 123 45 67', type: 'string' },
        { key: 'order.minAmount', value: 200, type: 'number' },
        { key: 'shipping.freeThreshold', value: 500, type: 'number' },
    ]) {
        await db.collection('systemsettings').updateOne({ key: s.key }, { $setOnInsert: s }, { upsert: true });
    }
    console.log('✅ Ayarlar');

    console.log('\n🎉 SEED TAMAMLANDI!');
    console.log('─────────────────────────');
    console.log('👤 Admin:    admin@entas.com / Admin123!');
    console.log('👤 Müşteri:  demo@musteri.com / Demo123!');
    console.log('📦 ' + prods.length + ' ürün, 12 kategori, 10 marka');
    console.log('🏢 5 B2B müşteri');
    console.log('─────────────────────────');

    await mongoose.disconnect();
}
seed().catch(e => { console.error(e); process.exit(1); });
