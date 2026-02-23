'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Search, Plus, Eye, Building2 } from 'lucide-react';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '20');
            if (search) params.set('search', search);
            const res = await api.customers(params.toString());
            setCustomers(res.data || []);
            setPagination(res.pagination || {});
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchCustomers(); }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCustomers();
    };

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h2>Müşteriler</h2>
                    <p>Tüm B2B müşterilerinizi yönetin</p>
                </div>
                <a href="/customers/new" className="btn btn-primary">
                    <Plus size={18} /> Yeni Müşteri
                </a>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Müşteri Listesi ({pagination.total || 0})</h3>
                    <form onSubmit={handleSearch}>
                        <div className="search-bar">
                            <Search size={16} />
                            <input
                                placeholder="Firma adı, cari kodu veya vergi no..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Cari Kodu</th>
                            <th>Firma</th>
                            <th>İl / İlçe</th>
                            <th>Grup</th>
                            <th>Satış Temsilcisi</th>
                            <th>Durum</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((c) => (
                            <tr key={c._id}>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.accountCode}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Building2 size={16} color="var(--text-muted)" />
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {c.companyName}
                                        </span>
                                    </div>
                                </td>
                                <td>{c.city || '-'} / {c.district || '-'}</td>
                                <td>{c.groupId?.name || '-'}</td>
                                <td>{c.salesRepId ? `${c.salesRepId.firstName} ${c.salesRepId.lastName}` : '-'}</td>
                                <td>
                                    <span className={`badge-status ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                        {c.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td>
                                    <a href={`/customers/${c._id}`} className="btn btn-sm btn-outline">
                                        <Eye size={14} /> Detay
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {!loading && customers.length === 0 && (
                            <tr>
                                <td colSpan={7} className="empty-state">
                                    <h3>Müşteri bulunamadı</h3>
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
