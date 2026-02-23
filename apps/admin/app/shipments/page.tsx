'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Truck, RefreshCw } from 'lucide-react';

const statusLabels: Record<string, string> = {
    preparing: 'Hazırlanıyor', shipped: 'Kargoda', in_transit: 'Taşımada', delivered: 'Teslim', returned: 'İade',
};

export default function ShipmentsPage() {
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.shipments().then((res) => setShipments(res.data || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <div className="page-header">
                <div><h2>Sevkiyat</h2><p>Kargo ve teslimat takibi</p></div>
                <button className="btn btn-outline" onClick={() => location.reload()}><RefreshCw size={16} /> Yenile</button>
            </div>
            <div className="table-container">
                <table>
                    <thead><tr><th>Takip No</th><th>Kargo</th><th>Durum</th><th>Tarih</th></tr></thead>
                    <tbody>
                        {shipments.map((s: any) => (
                            <tr key={s._id}>
                                <td style={{ fontFamily: 'monospace' }}>{s.trackingNumber || '-'}</td>
                                <td>{s.carrier}</td>
                                <td><span className={`badge-status badge-${s.status}`}>{statusLabels[s.status] || s.status}</span></td>
                                <td>{new Date(s.createdAt).toLocaleDateString('tr-TR')}</td>
                            </tr>
                        ))}
                        {!loading && shipments.length === 0 && <tr><td colSpan={4} className="empty-state"><h3>Sevkiyat bulunamadı</h3></td></tr>}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
