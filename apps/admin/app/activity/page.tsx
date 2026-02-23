'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Activity, User, ShoppingCart, Package, Settings, LogIn } from 'lucide-react';

const iconMap: Record<string, any> = {
    user: User, order: ShoppingCart, product: Package, settings: Settings, auth: LogIn,
};

export default function ActivityPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.recentActivity(100).then((res) => setActivities(res.data || res || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <div className="page-header">
                <div><h2>Aktivite Logu</h2><p>Son sistem hareketleri</p></div>
            </div>

            <div className="table-container">
                <table>
                    <thead><tr><th>Zaman</th><th>Kullanıcı</th><th>İşlem</th><th>Kaynak</th><th>Detay</th></tr></thead>
                    <tbody>
                        {activities.map((a: any, i: number) => {
                            const Icon = iconMap[a.resource] || Activity;
                            return (
                                <tr key={i}>
                                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(a.createdAt).toLocaleString('tr-TR')}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.userId?.firstName || a.userId || '-'}</td>
                                    <td><span className={`badge-status badge-${a.action === 'delete' ? 'cancelled' : 'active'}`}>{a.action}</span></td>
                                    <td><Icon size={14} style={{ marginRight: 6 }} />{a.resource}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.resourceId || '-'}</td>
                                </tr>
                            );
                        })}
                        {!loading && activities.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Aktivite bulunamadı</td></tr>}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
