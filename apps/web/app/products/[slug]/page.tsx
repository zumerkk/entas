'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StoreLayout from '../../../components/StoreLayout';
import api from '../../../lib/api';
import { Package, ShoppingCart, Truck, Shield, Minus, Plus } from 'lucide-react';

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [product, setProduct] = useState<any>(null);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            api.product(slug).then(setProduct).catch(() => { }).finally(() => setLoading(false));
        }
    }, [slug]);

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    const addToCart = async () => {
        if (!product) return;
        try {
            await api.addToCart(product._id, qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
        } catch { }
    };

    if (loading) return <StoreLayout><div className="container section"><p>Yükleniyor...</p></div></StoreLayout>;
    if (!product) return <StoreLayout><div className="container section"><h2>Ürün bulunamadı</h2></div></StoreLayout>;

    return (
        <StoreLayout>
            <section className="section">
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
                        {/* Görsel */}
                        <div style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', borderRadius: 16, height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={80} color="var(--text-muted)" />
                        </div>

                        {/* Bilgi */}
                        <div>
                            <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)', marginBottom: 8 }}>{product.sku}</div>
                            <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 16, letterSpacing: -0.5 }}>{product.title}</h1>

                            {product.brandId?.name && (
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
                                    Marka: <strong>{product.brandId.name}</strong>
                                </div>
                            )}

                            <div style={{ marginBottom: 24 }}>
                                <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)', letterSpacing: -1 }}>
                                    {formatCurrency(product.basePrice)}
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>+KDV %{product.vatRate || 20}</div>
                            </div>

                            {product.description && (
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
                                    {product.description}
                                </p>
                            )}

                            {/* Adet + Sepet */}
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px' }}>
                                    <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
                                    <span style={{ fontWeight: 700, minWidth: 32, textAlign: 'center', fontSize: 16 }}>{qty}</span>
                                    <button className="qty-btn" onClick={() => setQty(qty + 1)}><Plus size={16} /></button>
                                </div>
                                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px 24px', fontSize: 15 }} onClick={addToCart}>
                                    <ShoppingCart size={18} /> {added ? 'Eklendi ✓' : 'Sepete Ekle'}
                                </button>
                            </div>

                            {/* Özellikler */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { icon: Truck, text: 'Aynı gün kargo' },
                                    { icon: Shield, text: 'Orijinal ürün garantisi' },
                                ].map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: 'var(--bg)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                                        <f.icon size={16} color="var(--primary)" /> {f.text}
                                    </div>
                                ))}
                            </div>

                            {/* Detaylar */}
                            <div style={{ marginTop: 32, padding: 20, background: 'var(--bg)', borderRadius: 12 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Ürün Detayları</h3>
                                <table style={{ width: '100%', fontSize: 13 }}>
                                    <tbody>
                                        <tr><td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>SKU</td><td style={{ fontFamily: 'monospace' }}>{product.sku}</td></tr>
                                        <tr><td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Birim</td><td>{product.unit || 'adet'}</td></tr>
                                        <tr><td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>KDV</td><td>%{product.vatRate || 20}</td></tr>
                                        {product.barcode && <tr><td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Barkod</td><td>{product.barcode}</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
