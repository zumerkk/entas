'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Search, Eye, RefreshCw } from 'lucide-react';

const statusLabels: Record<string, string> = {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    processing: 'İşleniyor',
    shipped: 'Kargoda',
    delivered: 'Teslim',
    cancelled: 'İptal',
    refunded: 'İade',
    quote_requested: 'Teklif',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '20');
            if (statusFilter) params.set('status', statusFilter);
            const res = await api.orders(params.toString());
            setOrders(res.data || []);
            setPagination(res.pagination || {});
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchOrders(); }, [page, statusFilter]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h2>Siparişler</h2>
                    <p>Tüm siparişleri yönetin</p>
                </div>
                <button className="btn btn-outline" onClick={fetchOrders}>
                    <RefreshCw size={16} /> Yenile
                </button>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Sipariş Listesi</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <select
                            className="form-control"
                            style={{ width: 160 }}
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="">Tüm Durumlar</option>
                            {Object.entries(statusLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Sipariş No</th>
                            <th>Tarih</th>
                            <th>Durum</th>
                            <th>Kalem</th>
                            <th>Toplam</th>
                            <th>Ödeme</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {order.orderNumber}
                                </td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>
                                    <span className={`badge-status badge-${order.status}`}>
                                        {statusLabels[order.status] || order.status}
                                    </span>
                                </td>
                                <td>{order.items?.length || 0} ürün</td>
                                <td style={{ fontWeight: 600 }}>{formatCurrency(order.grandTotal)}</td>
                                <td>{order.paymentMethod || '-'}</td>
                                <td>
                                    <a href={`/orders/${order._id}`} className="btn btn-sm btn-outline">
                                        <Eye size={14} /> Detay
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {!loading && orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="empty-state">
                                    <h3>Sipariş bulunamadı</h3>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {pagination.totalPages > 1 && (
                    <div className="pagination">
                        {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => (
                            <button
                                key={i + 1}
                                className={page === i + 1 ? 'active' : ''}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
