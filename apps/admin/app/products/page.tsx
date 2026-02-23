'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            params.set('limit', '20');
            if (search) params.set('search', search);
            const res = await api.products(params.toString());
            setProducts(res.data || []);
            setPagination(res.pagination || {});
        } catch { }
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchProducts();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        try {
            await api.deleteProduct(id);
            fetchProducts();
        } catch { }
    };

    const formatCurrency = (v: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <h2>Ürünler</h2>
                    <p>Ürün kataloğunu yönetin</p>
                </div>
                <a href="/products/new" className="btn btn-primary">
                    <Plus size={18} /> Yeni Ürün
                </a>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>Ürün Listesi ({pagination.total || 0})</h3>
                    <form onSubmit={handleSearch}>
                        <div className="search-bar">
                            <Search size={16} />
                            <input
                                placeholder="Ürün ara (SKU, ad, barkod)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </form>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Ürün Adı</th>
                            <th>Marka</th>
                            <th>Fiyat</th>
                            <th>KDV</th>
                            <th>Durum</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((p) => (
                            <tr key={p._id}>
                                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.sku}</td>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</td>
                                <td>{p.brandId?.name || '-'}</td>
                                <td style={{ fontWeight: 600 }}>{formatCurrency(p.basePrice)}</td>
                                <td>%{p.vatRate || 20}</td>
                                <td>
                                    <span className={`badge-status ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                        {p.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <a href={`/products/${p._id}`} className="btn btn-sm btn-outline">
                                        <Edit size={14} />
                                    </a>
                                    <button className="btn btn-sm btn-outline" onClick={() => handleDelete(p._id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!loading && products.length === 0 && (
                            <tr>
                                <td colSpan={7} className="empty-state">
                                    <h3>Ürün bulunamadı</h3>
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
