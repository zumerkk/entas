'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { Package as PackageIcon, Eye, RefreshCw } from 'lucide-react';

const statusLabels: Record<string, string> = {
    pending: 'Bekliyor', confirmed: 'Onaylandı', processing: 'Hazırlanıyor',
    shipped: 'Kargoda', delivered: 'Teslim Edildi', cancelled: 'İptal', refunded: 'İade',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [page, setPage] = useState(1);

    useEffect(() => {
        api.myOrders(page).then((res) => setOrders(res.data || [])).catch(() => { });
    }, [page]);

    const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <StoreLayout>
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Siparişlerim</h2>
                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60 }}>
                            <PackageIcon size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: 20, marginBottom: 8 }}>Henüz siparişiniz yok</h3>
                            <Link href="/products" className="btn btn-primary" style={{ marginTop: 16 }}>Alışverişe Başla</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {orders.map((o: any) => (
                                <div key={o._id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, display: 'flex', alignItems: 'center', gap: 24 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{o.orderNumber}</div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{formatDate(o.createdAt)} · {o.items?.length || 0} ürün</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                            {statusLabels[o.status] || o.status}
                                        </span>
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)', minWidth: 120, textAlign: 'right' }}>
                                        {formatCurrency(o.grandTotal)}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn btn-sm btn-outline" onClick={() => api.reorder(o._id).then(() => window.location.href = '/cart')}>
                                            <RefreshCw size={14} /> Tekrarla
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </StoreLayout>
    );
}
