'use client';

import { useState, useEffect } from 'react';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    const [cart, setCart] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const [c, s] = await Promise.all([api.getCart(), api.cartSummary()]);
            setCart(c);
            setSummary(s);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchCart(); }, []);

    const updateQty = async (productId: string, qty: number) => {
        try {
            if (qty <= 0) { await api.removeCartItem(productId); }
            else { await api.updateCartItem(productId, qty); }
            fetchCart();
        } catch { }
    };

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    if (loading) return <StoreLayout><div className="container section"><p>Yükleniyor...</p></div></StoreLayout>;

    return (
        <StoreLayout>
            <section className="section">
                <div className="container">
                    <h2 className="section-title"><ShoppingCart size={24} style={{ marginRight: 8 }} /> Sepetim</h2>

                    {!cart?.items?.length ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <ShoppingCart size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Sepetiniz boş</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Ürün eklemek için mağazayı gezin</p>
                            <Link href="/products" className="btn btn-primary">Ürünleri Keşfet</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 }}>
                            {/* Ürünler */}
                            <div>
                                {cart.items.map((item: any) => (
                                    <div key={item.productId} className="cart-item">
                                        <div className="cart-item-info">
                                            <div className="cart-item-title">Ürün {item.productId.toString().slice(-6)}</div>
                                            <div className="cart-item-sku">Birim: {formatCurrency(item.unitPrice || 0)}</div>
                                        </div>
                                        <div className="cart-item-qty">
                                            <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity - 1)}>
                                                <Minus size={14} />
                                            </button>
                                            <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQty(item.productId, item.quantity + 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div style={{ fontWeight: 700, minWidth: 100, textAlign: 'right' }}>
                                            {formatCurrency((item.unitPrice || 0) * item.quantity)}
                                        </div>
                                        <button className="qty-btn" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => updateQty(item.productId, 0)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Özet */}
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, height: 'fit-content', position: 'sticky', top: 96 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Sipariş Özeti</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                                    <span>Ara Toplam</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(summary?.subtotal || 0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                                    <span>KDV</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(summary?.vatTotal || 0)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                                    <span>Toplam</span>
                                    <span>{formatCurrency(summary?.grandTotal || 0)}</span>
                                </div>
                                <Link href="/checkout" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
                                    Siparişi Tamamla <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </StoreLayout>
    );
}
