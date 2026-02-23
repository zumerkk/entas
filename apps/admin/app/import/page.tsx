'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const statusLabels: Record<string, { label: string; icon: any; color: string }> = {
    pending: { label: 'Bekliyor', icon: Clock, color: 'var(--warning)' },
    processing: { label: 'İşleniyor', icon: Clock, color: 'var(--info)' },
    completed: { label: 'Tamamlandı', icon: CheckCircle, color: 'var(--success)' },
    completed_with_errors: { label: 'Hatalı', icon: AlertCircle, color: 'var(--warning)' },
    failed: { label: 'Başarısız', icon: AlertCircle, color: 'var(--danger)' },
};

export default function ImportPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.importJobs().then((res) => setJobs(res.data || [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <div className="page-header">
                <div><h2>Toplu İşlem</h2><p>CSV/Excel ile toplu ürün ve stok yükleme</p></div>
                <button className="btn btn-primary"><Upload size={18} /> Yeni Import</button>
            </div>

            <div className="table-container">
                <table>
                    <thead><tr><th>Dosya</th><th>Tür</th><th>Toplam</th><th>Başarılı</th><th>Hatalı</th><th>Durum</th><th>Tarih</th></tr></thead>
                    <tbody>
                        {jobs.map((j: any) => {
                            const s = statusLabels[j.status] || statusLabels.pending;
                            const Icon = s.icon;
                            return (
                                <tr key={j._id}>
                                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{j.fileName}</td>
                                    <td>{j.type}</td>
                                    <td>{j.totalRows}</td>
                                    <td style={{ color: 'var(--success)' }}>{j.successRows}</td>
                                    <td style={{ color: j.errorRows > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>{j.errorRows}</td>
                                    <td>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.color }}>
                                            <Icon size={14} /> {s.label}
                                        </span>
                                    </td>
                                    <td>{new Date(j.createdAt).toLocaleDateString('tr-TR')}</td>
                                </tr>
                            );
                        })}
                        {!loading && jobs.length === 0 && <tr><td colSpan={7} className="empty-state"><h3>Import kaydı yok</h3></td></tr>}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
