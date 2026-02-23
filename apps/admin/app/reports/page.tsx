'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { BarChart3, TrendingUp, Users, Package } from 'lucide-react';

export default function ReportsPage() {
    const [revenue, setRevenue] = useState<any>(null);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    useEffect(() => {
        api.revenueReport(period, 30).then(setRevenue).catch(() => { });
        api.topProducts(10).then(setTopProducts).catch(() => { });
        api.topCustomers(10).then(setTopCustomers).catch(() => { });
    }, [period]);

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    return (
        <AdminLayout>
            <div className="page-header">
                <div><h2>Raporlar</h2><p>Satış ve performans analizleri</p></div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                        <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPeriod(p)}>
                            {p === 'daily' ? 'Günlük' : p === 'weekly' ? 'Haftalık' : 'Aylık'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 32 }}>
                <div className="card">
                    <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={18} color="var(--success)" /> Gelir Trendi ({period === 'daily' ? 'Günlük' : period === 'weekly' ? 'Haftalık' : 'Aylık'})
                    </h3>
                    {revenue?.data?.map((d: any) => (
                        <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                            <span>{d._id}</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(d.revenue)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({d.orderCount} sipariş)</span></span>
                        </div>
                    ))}
                    {(!revenue?.data || revenue.data.length === 0) && <div className="empty-state"><h3>Veri yok</h3></div>}
                </div>

                <div>
                    <div className="card" style={{ marginBottom: 24 }}>
                        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package size={18} color="var(--accent)" /> En Çok Satan Ürünler
                        </h3>
                        {topProducts.map((p: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                                <span>#{i + 1} {p.sku}</span>
                                <span style={{ fontWeight: 600 }}>{p.totalSold} adet</span>
                            </div>
                        ))}
                    </div>

                    <div className="card">
                        <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={18} color="var(--info)" /> En İyi Müşteriler
                        </h3>
                        {topCustomers.map((c: any, i: number) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                                <span>#{i + 1} {c.customer?.companyName || c._id}</span>
                                <span style={{ fontWeight: 600 }}>{formatCurrency(c.totalSpent)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
