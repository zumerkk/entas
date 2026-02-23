# ENTAŞ B2B E-Ticaret Platformu

Endüstriyel ürünler için kapsamlı B2B e-ticaret platformu. NestJS + Next.js + React Native monorepo.

## 🏗️ Mimari

```
entec/
├── apps/
│   ├── api/          # NestJS Backend      (port 3001)
│   ├── admin/        # Next.js Admin       (port 3002)
│   ├── web/          # Next.js Storefront  (port 3000)
│   └── mobile/       # Expo React Native
├── packages/
│   ├── shared/       # Ortak tipler & util
│   └── ui/           # Paylaşımlı bileşenler
├── docker-compose.yml
└── turbo.json
```

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js ≥ 18
- pnpm ≥ 8
- MongoDB ≥ 6 (veya Docker)
- Redis (opsiyonel)

### Kurulum

```bash
# Bağımlılıklar
pnpm install

# Environment
cp apps/api/.env.example apps/api/.env

# MongoDB (Docker ile)
docker compose up -d mongo redis

# Seed data
cd apps/api && npx ts-node src/seed.ts

# Geliştirme sunucuları
pnpm --filter @entec/api dev      # API    → http://localhost:3001
pnpm --filter @entec/admin dev    # Admin  → http://localhost:3002
pnpm --filter @entec/web dev      # Web    → http://localhost:3000
pnpm --filter @entec/mobile dev   # Mobile → Expo Go
```

### Docker ile Tümünü Çalıştır

```bash
docker compose up -d
docker compose --profile dev up -d  # + Mongo Express UI
```

## 📚 API Dokümantasyonu

Swagger UI: `http://localhost:3001/docs`

### Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@entas.com | Admin123! |
| Müşteri | demo@musteri.com | Demo123! |

## 🧩 API Modülleri (15)

| Modül | Endpoint | Açıklama |
|-------|----------|----------|
| Auth | 6 | JWT, brute-force koruma, RBAC |
| Catalog | 21 | Products, Categories, Brands, Search |
| Pricing | 4 | 5 katmanlı fiyat motoru |
| Orders | 25 | Cart, Checkout, Customers, Inventory |
| Import | 4 | Toplu CSV/Excel yükleme |
| Promotions | 8 | Kampanya + kupon |
| Settings | 8 | Key-value + feature flags |
| Shipments | 6 | Kargo takip |
| Webhooks | 4 | HMAC-SHA256 event dispatch |
| Reports | 6 | Dashboard, gelir, top listeler |
| Media | 3 | Dosya yükleme (multer) |
| Notifications | 3 | Email/SMS/push |
| Health | 2 | Sağlık kontrolü |

## 🔐 Güvenlik

- **JWT**: Access token (15dk) + Refresh token (7 gün) + Token rotation
- **Brute Force**: 5 başarısız giriş → 15dk hesap kilitleme
- **RBAC**: `@Roles()` + `@Permissions()` + `@Public()` dekoratörleri
- **Rate Limiting**: 3 katmanlı (short/medium/long)
- **Audit Log**: Tüm CRUD işlemler otomatik loglanır
- **CORS**: Whitelist tabanlı

## 📱 Platformlar

### Admin Panel (Next.js)
Dark mode, 11 sayfa: Dashboard, Siparişler, Ürünler, Müşteriler, Kategoriler, Markalar, Sevkiyat, Raporlar, Promosyonlar, Ayarlar, Import

### Web Storefront (Next.js)
Light B2B tasarım, 7 sayfa: Homepage (hero + search), Ürünler, Sepet, Siparişler, Kategoriler, Arama, Giriş

### Mobile (Expo)
5 ekran (tab nav): Ürünler (infinite scroll), Sepet, Siparişler, Profil, Giriş

## 🧰 Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | NestJS, MongoDB (Mongoose), Redis |
| Admin | Next.js 14, Lucide React |
| Web | Next.js 14, Lucide React |
| Mobile | Expo SDK 52, React Native |
| Monorepo | pnpm workspaces, Turborepo |
| CI/CD | Docker Compose |

## 📝 Lisans

Tüm hakları saklıdır © 2026 ENTAŞ
