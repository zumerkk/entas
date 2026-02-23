'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Tag, Plus } from 'lucide-react';

export default function BrandsPage() {
    const [brands, setBrands] = useState<any[]>([]);

    useEffect(() => {
        api.brands().then((res) => setBrands(res.data || res || [])).catch(() => { });
    }, []);

    return (
        <AdminLayout>
            <div className="page-header">
                <div><h2>Markalar</h2><p>Marka yönetimi</p></div>
                <button className="btn btn-primary"><Plus size={18} /> Yeni Marka</button>
            </div>
            <div className="table-container">
                <table>
                    <thead><tr><th>Marka</th><th>Slug</th><th>Web</th><th>Durum</th></tr></thead>
                    <tbody>
                        {(Array.isArray(brands) ? brands : []).map((b: any) => (
                            <tr key={b._id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}><Tag size={14} style={{ marginRight: 8 }} />{b.name}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{b.slug}</td>
                                <td>{b.website || '-'}</td>
                                <td><span className={`badge-status ${b.isActive !== false ? 'badge-active' : 'badge-inactive'}`}>{b.isActive !== false ? 'Aktif' : 'Pasif'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
