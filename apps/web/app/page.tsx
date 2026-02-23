'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ArrowRight, Star, Truck } from 'lucide-react';
import StoreLayout from '../components/StoreLayout';
import api from '../lib/api';

const slides = [
    { cls: 'slide-1', title: 'Endüstriyel Ürünlerde B2B Fiyat Avantajı', desc: 'Bosch, Schneider, Siemens — 200+ markada toptan fiyatlarla hemen sipariş verin.', cta: 'Alışverişe Başla' },
    { cls: 'slide-2', title: 'Kışa Özel Isıtma Ürünlerinde Büyük İndirim!', desc: 'Kombi, radyatör ve termosifon modellerinde %25\'e varan indirimler.', cta: 'İndirimleri Keşfet' },
    { cls: 'slide-3', title: 'Profesyonel El Aletlerinde Ücretsiz Kargo', desc: '500 TL üzeri siparişlerinizde kargo bizden. Makita, DeWalt, Bosch stokta.', cta: 'Ürünleri İncele' },
];

const catShowcase1 = [
    { name: 'Elektrikli El Aletleri', slug: 'hirdavat-el-aletleri', icon: '🔧' },
    { name: 'Otomasyon & PLC', slug: 'otomasyon-kontrol', icon: '⚙️' },
    { name: 'Aydınlatma Çözümleri', slug: 'aydinlatma', icon: '🔦' },
    { name: 'İş Güvenliği Ekipmanları', slug: 'is-guvenligi', icon: '🦺' },
];

const catShowcase2 = [
    { name: 'Isıtma & Soğutma Sistemleri', slug: 'isitma-sogutma', icon: '🌡️' },
    { name: 'Kablo & Elektrik Aksesuar', slug: 'kablo-aksesuar', icon: '🔌' },
    { name: 'Bahçe & Dış Mekan', slug: 'bahce-dis-mekan', icon: '🌿' },
    { name: 'Makine & Endüstriyel', slug: 'makine-endustriyel', icon: '🏭' },
];

const brandNames = ['Bosch', 'Schneider', 'Siemens', 'ABB', 'Legrand', 'Makita', 'DeWalt', 'Viko', 'Klemsan', 'Cimco'];

function renderStars(rating: number) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}

function ProductCard({ p }: { p: any }) {
    const discount = p.oldPrice ? Math.round((1 - p.basePrice / p.oldPrice) * 100) : 0;
    return (
        <Link href={`/products/${p.slug || p.sku}`} className="product-card">
            {discount > 0 && <div className="product-card-badge badge-discount">%{discount}</div>}
            {!discount && p.freeShipping && <div className="product-card-badge badge-free-ship"><Truck size={10} /> Kargo Bedava</div>}
            <div className="product-card-img">{p.categoryIcon || '📦'}</div>
            <div className="product-card-body">
                <div className="product-card-rating">
                    <span className="stars">{renderStars(p.rating || 0)}</span>
                    <span className="rating-score">{(p.rating || 0).toFixed(1)}</span>
                    <span className="rating-count">({p.reviewCount || 0})</span>
                </div>
                <div className="product-card-title">{p.title}</div>
                <div className="product-card-price-row">
                    {p.oldPrice && <span className="product-card-old-price">{formatPrice(p.oldPrice)} TL</span>}
                    <span className="product-card-price">{formatPrice(p.basePrice)} <span className="currency">TL</span></span>
                </div>
                {p.freeShipping && <div className="product-card-shipping">Kargo Bedava</div>}
            </div>
        </Link>
    );
}

export default function HomePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        api.products('limit=50').then((r) => setProducts(r.data || r || [])).catch(() => { });
    }, []);

    // Auto-slide
    useEffect(() => {
        const t = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), 5000);
        return () => clearInterval(t);
    }, []);

    const discounted = products.filter((p) => p.oldPrice && p.oldPrice > p.basePrice);
    const popular = products.filter((p) => (p.reviewCount || 0) > 100);
    const newProducts = [...products].reverse().slice(0, 10);

    return (
        <StoreLayout>
            <div className="container">
                {/* ─── Hero Slider ─── */}
                <div className="slider">
                    <div className="slider-track" style={{ transform: `translateX(-${slideIndex * 100}%)` }}>
                        {slides.map((s, i) => (
                            <div key={i} className={`slide ${s.cls}`}>
                                <div>
                                    <h2>{s.title}</h2>
                                    <p>{s.desc}</p>
                                    <Link href="/products" className="btn-slide">
                                        {s.cta} <ArrowRight size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="slider-dots">
                        {slides.map((_, i) => (
                            <button key={i} className={`slider-dot ${i === slideIndex ? 'active' : ''}`} onClick={() => setSlideIndex(i)} />
                        ))}
                    </div>
                </div>

                {/* ─── Quick Filters ─── */}
                <div className="quick-filters">
                    <Link href="/products?discount=true" className="quick-filter outline-orange">🔥 Kampanyalar</Link>
                    <Link href="/products?sort=bestseller" className="quick-filter">⭐ Çok Satanlar</Link>
                    <Link href="/products?sort=newest" className="quick-filter">🆕 Yeni Ürünler</Link>
                    <Link href="/products?freeShipping=true" className="quick-filter">🚚 Ücretsiz Kargo</Link>
                    <Link href="/products?category=hirdavat-el-aletleri" className="quick-filter">🔧 El Aletleri</Link>
                    <Link href="/products?category=elektrik-aydinlatma" className="quick-filter">💡 Elektrik</Link>
                </div>

                {/* ─── Category Showcase 1 ─── */}
                <div className="section">
                    <div className="cat-showcase">
                        {catShowcase1.map((c) => (
                            <Link key={c.slug} href={`/products?category=${c.slug}`} className="cat-showcase-card">
                                <div className="cat-showcase-header">
                                    <h3>{c.name}</h3>
                                    <div className="cat-showcase-arrow"><ArrowRight size={16} /></div>
                                </div>
                                <div className="cat-showcase-img">{c.icon}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ─── İndirimli Popüler Ürünler ─── */}
                {discounted.length > 0 && (
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">🔥 İndirimli Popüler Ürünler</h2>
                            <Link href="/products?discount=true" className="section-more">Tümünü Keşfet <ChevronRight size={14} /></Link>
                        </div>
                        <div className="product-carousel">
                            {discounted.map((p) => <ProductCard key={p._id || p.sku} p={p} />)}
                        </div>
                    </div>
                )}

                {/* ─── Category Showcase 2 ─── */}
                <div className="section">
                    <div className="cat-showcase">
                        {catShowcase2.map((c) => (
                            <Link key={c.slug} href={`/products?category=${c.slug}`} className="cat-showcase-card">
                                <div className="cat-showcase-header">
                                    <h3>{c.name}</h3>
                                    <div className="cat-showcase-arrow"><ArrowRight size={16} /></div>
                                </div>
                                <div className="cat-showcase-img">{c.icon}</div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* ─── Çok Satan Ürünler ─── */}
                {popular.length > 0 && (
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">⭐ Çok Satan Ürünler</h2>
                            <Link href="/products?sort=bestseller" className="section-more">Tümünü Keşfet <ChevronRight size={14} /></Link>
                        </div>
                        <div className="product-carousel">
                            {popular.map((p) => <ProductCard key={p._id || p.sku} p={p} />)}
                        </div>
                    </div>
                )}

                {/* ─── Yeni Ürünler ─── */}
                {newProducts.length > 0 && (
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">🆕 Yeni Gelenler</h2>
                            <Link href="/products?sort=newest" className="section-more">Tümünü Gör <ChevronRight size={14} /></Link>
                        </div>
                        <div className="product-carousel">
                            {newProducts.map((p) => <ProductCard key={p._id || p.sku} p={p} />)}
                        </div>
                    </div>
                )}

                {/* ─── Brand Logos ─── */}
                <div className="section">
                    <div className="section-header">
                        <h2 className="section-title">Markalarımız</h2>
                    </div>
                    <div className="brands-row">
                        {brandNames.map((b) => (
                            <span key={b} className="brand-logo">{b}</span>
                        ))}
                    </div>
                </div>

                {/* ─── Info Bar ─── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '32px 0', borderTop: '1px solid var(--border)' }}>
                    {[
                        { icon: '🚚', title: 'Ücretsiz Kargo', desc: '500 TL üzeri siparişlerde' },
                        { icon: '🔒', title: 'Güvenli Ödeme', desc: 'SSL + 3D Secure' },
                        { icon: '↩️', title: 'Kolay İade', desc: '14 gün içinde iade' },
                        { icon: '📞', title: '7/24 Destek', desc: 'Müşteri temsilcisi' },
                    ].map((item) => (
                        <div key={item.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 28 }}>{item.icon}</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </StoreLayout>
    );
}
