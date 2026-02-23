'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';
import { ArrowLeft, Package, User, CreditCard, Truck, FileText } from 'lucide-react';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
    pending: 'Bekliyor', confirmed: 'Onaylandı', processing: 'İşleniyor',
    shipped: 'Kargoda', delivered: 'Teslim', cancelled: 'İptal', refunded: 'İade',
};
const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<any>(null);
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.order(id).then((o) => { setOrder(o); setNewStatus(o.status); }).catch(() => { }).finally(() => setLoading(false));
    }, [id]);

    const updateStatus = async () => {
        try {
            await api.updateOrderStatus(id, newStatus, notes);
            const updated = await api.order(id);
            setOrder(updated);
            setNotes('');
        } catch { }
    };

    const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) return <AdminLayout><div className="page-header"><div><h2>Yükleniyor...</h2></div></div></AdminLayout>;
    if (!order) return <AdminLayout><div className="page-header"><div><h2>Sipariş bulunamadı</h2></div></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <Link href="/orders" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Siparişlere Dön
                    </Link>
                    <h2>{order.orderNumber}</h2>
                    <p>{fmtDate(order.createdAt)}</p>
                </div>
                <span className={`badge-status badge-${order.status}`} style={{ fontSize: 14, padding: '6px 16px' }}>
                    {statusLabels[order.status] || order.status}
                </span>
            </div>

            <div className="grid-2" style={{ marginBottom: 32 }}>
                {/* Ürünler */}
                <div className="card">
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Package size={18} /> Sipariş Kalemleri</h3>
                    {order.items?.map((item: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title || `Ürün #${item.productId?.toString().slice(-6)}`}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>SKU: {item.sku || '-'} · {item.quantity} × {fmt(item.unitPrice)}</div>
                            </div>
                            <div style={{ fontWeight: 700 }}>{fmt(item.lineTotal || item.unitPrice * item.quantity)}</div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>
                        <span>Toplam</span>
                        <span>{fmt(order.grandTotal)}</span>
                    </div>
                </div>

                {/* Detaylar */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={18} /> Ödeme</h3>
                        <p style={{ fontSize: 14 }}>Yöntem: <strong>{order.paymentMethod || 'Belirtilmemiş'}</strong></p>
                        <p style={{ fontSize: 14 }}>Ara Toplam: {fmt(order.subtotal)}</p>
                        <p style={{ fontSize: 14 }}>KDV: {fmt(order.vatTotal)}</p>
                        {order.discount > 0 && <p style={{ fontSize: 14, color: 'var(--success)' }}>İndirim: -{fmt(order.discount)}</p>}
                    </div>

                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Truck size={18} /> Teslimat</h3>
                        <p style={{ fontSize: 14 }}>{order.shippingAddress?.fullAddress || 'Adres belirtilmemiş'}</p>
                    </div>

                    {/* Durum Güncelleme */}
                    <div className="card">
                        <h3 style={{ marginBottom: 12 }}>Durum Güncelle</h3>
                        <div className="form-group">
                            <select className="form-control" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                                {statusOptions.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <textarea className="form-control" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="İç not..." />
                        </div>
                        <button className="btn btn-primary btn-block" onClick={updateStatus}>Durumu Güncelle</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
