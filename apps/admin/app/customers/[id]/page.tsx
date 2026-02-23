'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';
import { ArrowLeft, Building2, ShoppingCart, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [customer, setCustomer] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.customer(id).then(setCustomer).catch(() => { }).finally(() => setLoading(false));
        api.request(`/orders/admin?customerId=${id}&limit=10`).then((r) => setOrders(r.data || [])).catch(() => { });
    }, [id]);

    const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    if (loading) return <AdminLayout><div className="page-header"><div><h2>Yükleniyor...</h2></div></div></AdminLayout>;
    if (!customer) return <AdminLayout><div className="page-header"><div><h2>Müşteri bulunamadı</h2></div></div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <Link href="/customers" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Müşterilere Dön
                    </Link>
                    <h2>{customer.companyName}</h2>
                    <p>Cari Kod: {customer.accountCode}</p>
                </div>
                <span className={`badge-status ${customer.isActive ? 'badge-active' : 'badge-inactive'}`} style={{ fontSize: 14, padding: '6px 16px' }}>
                    {customer.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </div>

            <div className="grid-2" style={{ marginBottom: 32 }}>
                {/* Firma Bilgileri */}
                <div className="card">
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Building2 size={18} /> Firma Bilgileri</h3>
                    <table style={{ width: '100%', fontSize: 14 }}>
                        <tbody>
                            {[
                                ['Firma', customer.companyName],
                                ['Cari Kodu', customer.accountCode],
                                ['Vergi No', customer.taxNumber || '-'],
                                ['Vergi Dairesi', customer.taxOffice || '-'],
                                ['Telefon', customer.phone || '-'],
                                ['E-posta', customer.email || '-'],
                            ].map(([label, val], i) => (
                                <tr key={i}>
                                    <td style={{ padding: '10px 0', color: 'var(--text-muted)', width: 140 }}>{label}</td>
                                    <td style={{ fontWeight: 600 }}>{val}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Adres */}
                <div>
                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} /> Adres</h3>
                        <p style={{ fontSize: 14 }}>{customer.address || customer.city || 'Adres belirtilmemiş'}</p>
                        {customer.city && <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{customer.city}{customer.district ? ` / ${customer.district}` : ''}</p>}
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><CreditCard size={18} /> Finansal</h3>
                        <p style={{ fontSize: 14 }}>Grup: <strong>{customer.groupId?.name || '-'}</strong></p>
                        <p style={{ fontSize: 14 }}>Temsilci: <strong>{customer.salesRepId ? `${customer.salesRepId.firstName} ${customer.salesRepId.lastName}` : '-'}</strong></p>
                        <p style={{ fontSize: 14 }}>Risk Limiti: <strong>{customer.creditLimit ? fmt(customer.creditLimit) : '-'}</strong></p>
                    </div>
                </div>
            </div>

            {/* Son Siparişler */}
            <div className="table-container">
                <div className="table-header">
                    <h3><ShoppingCart size={16} style={{ marginRight: 8 }} /> Son Siparişler</h3>
                </div>
                <table>
                    <thead><tr><th>Sipariş No</th><th>Tarih</th><th>Durum</th><th>Toplam</th></tr></thead>
                    <tbody>
                        {orders.map((o: any) => (
                            <tr key={o._id}>
                                <td><a href={`/orders/${o._id}`} style={{ fontWeight: 600, color: 'var(--accent)' }}>{o.orderNumber}</a></td>
                                <td>{new Date(o.createdAt).toLocaleDateString('tr-TR')}</td>
                                <td><span className={`badge-status badge-${o.status}`}>{o.status}</span></td>
                                <td style={{ fontWeight: 600 }}>{fmt(o.grandTotal)}</td>
                            </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Sipariş yok</td></tr>}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
