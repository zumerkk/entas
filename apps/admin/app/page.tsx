'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../lib/api';
import {
    ShoppingCart, Users, Package, TrendingUp,
    ArrowUpRight, ArrowDownRight, DollarSign, AlertTriangle,
} from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.dashboard()
            .then(setStats)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);

    if (loading) {
        return (
            <AdminLayout>
                <div className="page-header">
                    <div>
                        <h2>Dashboard</h2>
                        <p>Yükleniyor...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>ENTAŞ B2B platformu genel bakış</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
                        <ShoppingCart size={20} color="#6366f1" />
                    </div>
                    <div className="stat-value">{stats?.orders?.total || 0}</div>
                    <div className="stat-label">Toplam Sipariş</div>
                    <div className="stat-change up">
                        <ArrowUpRight size={14} /> Bu ay: {stats?.orders?.monthly || 0}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <DollarSign size={20} color="#10b981" />
                    </div>
                    <div className="stat-value">{formatCurrency(stats?.revenue?.monthly || 0)}</div>
                    <div className="stat-label">Aylık Gelir</div>
                    <div className="stat-change up">
                        <TrendingUp size={14} /> Bu ay
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>
                        <Users size={20} color="#3b82f6" />
                    </div>
                    <div className="stat-value">{stats?.customers?.total || 0}</div>
                    <div className="stat-label">Aktif Müşteri</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <Package size={20} color="#f59e0b" />
                    </div>
                    <div className="stat-value">{stats?.products?.active || 0}</div>
                    <div className="stat-label">Aktif Ürün</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>
                        <AlertTriangle size={20} color="#ef4444" />
                    </div>
                    <div className="stat-value">{stats?.inventory?.lowStockAlerts || 0}</div>
                    <div className="stat-label">Kritik Stok Uyarısı</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
                        <ShoppingCart size={20} color="#f59e0b" />
                    </div>
                    <div className="stat-value">{stats?.orders?.pending || 0}</div>
                    <div className="stat-label">Bekleyen Sipariş</div>
                </div>
            </div>
        </AdminLayout>
    );
}
