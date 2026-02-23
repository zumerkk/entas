'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, ChevronRight, Truck } from 'lucide-react';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';

const allCategories = [
    { name: 'Elektrik & Aydınlatma', slug: 'elektrik-aydinlatma' },
    { name: 'Hırdavat & El Aletleri', slug: 'hirdavat-el-aletleri' },
    { name: 'Boya & Yapı Kimyasalları', slug: 'boya-yapi' },
    { name: 'Tesisat', slug: 'tesisat' },
    { name: 'İş Güvenliği', slug: 'is-guvenligi' },
    { name: 'Otomasyon & Kontrol', slug: 'otomasyon-kontrol' },
    { name: 'Kablo & Aksesuar', slug: 'kablo-aksesuar' },
    { name: 'Aydınlatma', slug: 'aydinlatma' },
    { name: 'Isıtma & Soğutma', slug: 'isitma-sogutma' },
    { name: 'Bahçe & Dış Mekan', slug: 'bahce-dis-mekan' },
    { name: 'Makine & Endüstriyel', slug: 'makine-endustriyel' },
    { name: 'Mobilya & Dekorasyon', slug: 'mobilya-dekorasyon' },
];

const brandNames = ['Bosch', 'Schneider', 'Siemens', 'ABB', 'Legrand', 'Makita', 'DeWalt', 'Viko', 'Klemsan', 'Cimco'];

function renderStars(rating: number) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
}

export default function ProductsPage() {
    const params = useSearchParams();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const categoryFilter = params.get('category') || '';

    useEffect(() => {
        const q = categoryFilter ? `limit=50&category=${categoryFilter}` : 'limit=50';
        api.products(q).then((r) => setProducts(r.data || r || [])).catch(() => { }).finally(() => setLoading(false));
    }, [categoryFilter]);

    return (
        <StoreLayout>
            <div className="container" style={{ paddingTop: 24, paddingBottom: 48 }}>
                <div style={{ display: 'flex', gap: 24 }}>
                    {/* Sidebar */}
                    <div style={{ width: 260, flexShrink: 0 }}>
                        <div className="sidebar-filter" style={{ marginBottom: 16 }}>
                            <h3><Filter size={14} style={{ marginRight: 6 }} /> Kategoriler</h3>
                            {allCategories.map((c) => (
                                <Link key={c.slug} href={`/products?category=${c.slug}`} className="filter-item"
                                    style={{ fontWeight: categoryFilter === c.slug ? 700 : 400, color: categoryFilter === c.slug ? 'var(--primary)' : 'inherit' }}>
                                    <ChevronRight size={12} /> {c.name}
                                </Link>
                            ))}
                            {categoryFilter && (
                                <Link href="/products" className="btn btn-outline btn-sm btn-block" style={{ marginTop: 12 }}>
                                    Filtreyi Temizle
                                </Link>
                            )}
                        </div>

                        <div className="sidebar-filter">
                            <h3>Markalar</h3>
                            {brandNames.map((b) => (
                                <label key={b} className="filter-item">
                                    <input type="checkbox" style={{ accentColor: 'var(--primary)' }} /> {b}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: 18 }}>
                                    {categoryFilter ? allCategories.find(c => c.slug === categoryFilter)?.name || 'Ürünler' : 'Tüm Ürünler'}
                                </span>
                                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                                    ({products.length} ürün)
                                </span>
                            </div>
                            <select className="form-control" style={{ width: 200 }}>
                                <option>Önerilen Sıralama</option>
                                <option>Fiyat: Düşükten Yükseğe</option>
                                <option>Fiyat: Yüksekten Düşüğe</option>
                                <option>En Çok Satanlar</option>
                                <option>En Yeniler</option>
                            </select>
                        </div>

                        <div className="product-grid">
                            {products.map((p) => {
                                const discount = p.oldPrice ? Math.round((1 - p.basePrice / p.oldPrice) * 100) : 0;
                                return (
                                    <Link key={p._id || p.sku} href={`/products/${p.slug || p.sku}`} className="product-card" style={{ flex: 'unset' }}>
                                        {discount > 0 && <div className="product-card-badge badge-discount">%{discount}</div>}
                                        <div className="product-card-img">📦</div>
                                        <div className="product-card-body">
                                            <div className="product-card-rating">
                                                <span className="stars">{renderStars(p.rating || 0)}</span>
                                                <span className="rating-score">{(p.rating || 0).toFixed(1)}</span>
                                                <span className="rating-count">({p.reviewCount || 0})</span>
                                            </div>
                                            <div className="product-card-title">{p.title}</div>
                                            <div className="product-card-price-row">
                                                {p.oldPrice && <span className="product-card-old-price">{formatPrice(p.oldPrice)} TL</span>}
                                            </div>
                                            <div className="product-card-price">{formatPrice(p.basePrice)} <span className="currency">TL</span></div>
                                            {p.freeShipping && <div className="product-card-shipping"><Truck size={12} /> Kargo Bedava</div>}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {loading && <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Yükleniyor...</div>}
                        {!loading && products.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Ürün bulunamadı</div>
                                <div style={{ color: 'var(--text-muted)' }}>Farklı filtreler deneyebilirsiniz.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
