'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import { Search, ShoppingCart, User, LogOut, Package, Menu, ChevronRight, Heart, MapPin, Phone } from 'lucide-react';
import api from '../lib/api';

const categories = [
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

export default function StoreLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const token = api.getToken();
        if (token) {
            api.me().then(setUser).catch(() => { });
            api.getCart().then((c) => setCartCount(c.items?.length || 0)).catch(() => { });
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) router.push(`/search?q=${encodeURIComponent(search)}`);
    };

    return (
        <>
            {/* Top Bar */}
            <div className="topbar">
                <div className="topbar-inner">
                    <div>
                        <Phone size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        <strong>0212 123 45 67</strong>
                        <span style={{ margin: '0 12px', opacity: 0.6 }}>|</span>
                        B2B Endüstriyel Tedarik Platformu
                    </div>
                    <div>
                        <Link href="/track">Sipariş Takip</Link>
                        <Link href="/contact">Bize Ulaşın</Link>
                        <Link href="/about">Hakkımızda</Link>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="header">
                <div className="header-inner">
                    <Link href="/" className="header-logo">ENTAŞ</Link>

                    <form onSubmit={handleSearch} className="header-search">
                        <input
                            placeholder="Ürün, kategori veya marka ara..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button type="submit" className="header-search-btn">
                            <Search size={18} />
                        </button>
                    </form>

                    <div className="header-actions">
                        <Link href="/categories" className="header-action">
                            <MapPin size={20} />
                            <span>Şubeler</span>
                        </Link>

                        {user ? (
                            <>
                                <Link href="/orders" className="header-action">
                                    <Package size={20} />
                                    <span>Siparişler</span>
                                </Link>
                                <button className="header-action" onClick={() => { api.clearToken(); window.location.href = '/'; }}>
                                    <LogOut size={20} />
                                    <span>Çıkış</span>
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className="header-action">
                                <User size={20} />
                                <span>Giriş Yap</span>
                            </Link>
                        )}

                        <Link href="/cart" className="header-action" style={{ color: 'var(--primary)' }}>
                            <ShoppingCart size={22} />
                            <span>Sepetim</span>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Sub Navigation with Mega Menu */}
            <div className="subnav">
                <div className="subnav-inner">
                    <div className="subnav-categories">
                        <Menu size={16} />
                        Tüm Kategoriler
                        <div className="mega-menu">
                            <div className="mega-menu-grid">
                                {categories.map((cat) => (
                                    <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="mega-menu-item">
                                        <span className="icon">{cat.icon}</span>
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                    <Link href="/products?sort=newest" className="subnav-link highlight">🔥 Yeni Ürünler</Link>
                    <Link href="/products?discount=true" className="subnav-link">İndirimli Ürünler</Link>
                    <Link href="/products?sort=bestseller" className="subnav-link">⭐ Çok Satanlar</Link>
                    <Link href="/products?outlet=true" className="subnav-link">Outlet</Link>
                    <Link href="/brands" className="subnav-link">Markalar</Link>
                </div>
            </div>

            <main className="animate-in">{children}</main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-grid">
                        <div>
                            <div className="footer-brand">ENTAŞ</div>
                            <p>B2B Endüstriyel Tedarik Platformu. Elektrik, otomasyon, el aletleri ve daha fazlası için güvenilir ortağınız.</p>
                            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                                <span style={{ cursor: 'pointer', fontSize: 20 }}>📘</span>
                                <span style={{ cursor: 'pointer', fontSize: 20 }}>📷</span>
                                <span style={{ cursor: 'pointer', fontSize: 20 }}>🐦</span>
                                <span style={{ cursor: 'pointer', fontSize: 20 }}>🔗</span>
                            </div>
                        </div>
                        <div>
                            <h3>Kurumsal</h3>
                            <a href="/about">Hakkımızda</a>
                            <a href="/contact">İletişim</a>
                            <a href="/careers">Kariyer</a>
                            <a href="/terms">Kullanım Koşulları</a>
                        </div>
                        <div>
                            <h3>Müşteri</h3>
                            <a href="/faq">Sık Sorulan Sorular</a>
                            <a href="/track">Sipariş Takip</a>
                            <a href="/returns">İade & Değişim</a>
                            <a href="/register">B2B Üyelik</a>
                        </div>
                        <div>
                            <h3>Kategoriler</h3>
                            <a href="/products?category=elektrik-aydinlatma">Elektrik</a>
                            <a href="/products?category=hirdavat-el-aletleri">Hırdavat</a>
                            <a href="/products?category=otomasyon-kontrol">Otomasyon</a>
                            <a href="/products?category=tesisat">Tesisat</a>
                        </div>
                        <div>
                            <h3>İletişim</h3>
                            <a href="tel:+902121234567">📞 0212 123 45 67</a>
                            <a href="mailto:info@entas.com">✉️ info@entas.com</a>
                            <p style={{ marginTop: 8, fontSize: 12 }}>📍 İstanbul, Türkiye</p>
                            <p style={{ fontSize: 12, marginTop: 4 }}>Pzt-Cum: 08:00-18:00</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        © 2026 ENTAŞ B2B Endüstriyel Tedarik. Tüm hakları saklıdır. | KVKK | Gizlilik Politikası
                    </div>
                </div>
            </footer>
        </>
    );
}
