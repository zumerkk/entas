'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../../components/AdminLayout';
import api from '../../../lib/api';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        sku: '', title: '', description: '', basePrice: '', vatRate: '20',
        unit: 'adet', barcode: '', isActive: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const update = (k: string, v: any) => setForm({ ...form, [k]: v });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.sku || !form.title || !form.basePrice) { setError('SKU, başlık ve fiyat zorunlu'); return; }
        setLoading(true); setError('');
        try {
            await api.createProduct({
                ...form,
                basePrice: parseFloat(form.basePrice),
                vatRate: parseInt(form.vatRate),
            });
            router.push('/products');
        } catch (err: any) { setError(err.message); }
        setLoading(false);
    };

    return (
        <AdminLayout>
            <div className="page-header">
                <div>
                    <Link href="/products" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                        <ArrowLeft size={14} /> Ürünlere Dön
                    </Link>
                    <h2>Yeni Ürün</h2>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="grid-2">
                    <div className="card">
                        <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Temel Bilgiler</h3>
                        <div className="form-group">
                            <label>SKU *</label>
                            <input className="form-control" value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="BSH-GSR-180" required />
                        </div>
                        <div className="form-group">
                            <label>Ürün Adı *</label>
                            <input className="form-control" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="Ürün başlığı" required />
                        </div>
                        <div className="form-group">
                            <label>Açıklama</label>
                            <textarea className="form-control" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Ürün açıklaması..." />
                        </div>
                        <div className="form-group">
                            <label>Barkod</label>
                            <input className="form-control" value={form.barcode} onChange={(e) => update('barcode', e.target.value)} placeholder="8690000000000" />
                        </div>
                    </div>

                    <div>
                        <div className="card" style={{ marginBottom: 20 }}>
                            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Fiyat & Vergi</h3>
                            <div className="form-group">
                                <label>Baz Fiyat (TL) *</label>
                                <input type="number" step="0.01" className="form-control" value={form.basePrice} onChange={(e) => update('basePrice', e.target.value)} placeholder="0.00" required />
                            </div>
                            <div className="form-group">
                                <label>KDV Oranı (%)</label>
                                <select className="form-control" value={form.vatRate} onChange={(e) => update('vatRate', e.target.value)}>
                                    <option value="1">%1</option>
                                    <option value="10">%10</option>
                                    <option value="20">%20</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Birim</label>
                                <select className="form-control" value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                                    <option value="adet">Adet</option>
                                    <option value="kg">Kilogram</option>
                                    <option value="metre">Metre</option>
                                    <option value="rulo">Rulo</option>
                                    <option value="kova">Kova</option>
                                    <option value="paket">Paket</option>
                                    <option value="kutu">Kutu</option>
                                </select>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Durum</h3>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} />
                                <span>Aktif (mağazada görünsün)</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                    <Link href="/products" className="btn btn-outline">İptal</Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={16} /> {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
