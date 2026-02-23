'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { FolderTree, Plus } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.categories(true).then((res) => {
            setCategories(res.data || res || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h2>Kategoriler</h2>
                    <p>Ürün kategori ağacını yönetin</p>
                </div>
                <button className="btn btn-primary"><Plus size={18} /> Yeni Kategori</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Kategori</th>
                            <th>Slug</th>
                            <th>Derinlik</th>
                            <th>Sıra</th>
                            <th>Durum</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(categories) ? categories : []).map((c: any) => (
                            <tr key={c._id}>
                                <td style={{ paddingLeft: `${(c.depth || 0) * 24 + 24}px`, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    <FolderTree size={14} style={{ marginRight: 8 }} />
                                    {c.name}
                                </td>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.slug}</td>
                                <td>{c.depth || 0}</td>
                                <td>{c.sortOrder || 0}</td>
                                <td>
                                    <span className={`badge-status ${c.isActive !== false ? 'badge-active' : 'badge-inactive'}`}>
                                        {c.isActive !== false ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
