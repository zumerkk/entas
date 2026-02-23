'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Gift, Plus, Ticket } from 'lucide-react';

export default function PromotionsPage() {
    const [promos, setPromos] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [tab, setTab] = useState<'promos' | 'coupons'>('promos');

    useEffect(() => {
        api.request('/promotions').then((r) => setPromos(r.data || [])).catch(() => { });
        api.request('/promotions/coupons/list').then((r) => setCoupons(r.data || [])).catch(() => { });
    }, []);

    return (
        <AdminLayout>
            <div className="page-header">
                <div><h2>Promosyonlar</h2><p>Kampanya ve kupon yönetimi</p></div>
                <button className="btn btn-primary"><Plus size={18} /> Yeni {tab === 'promos' ? 'Promosyon' : 'Kupon'}</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`btn btn-sm ${tab === 'promos' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('promos')}>
                    <Gift size={14} /> Promosyonlar
                </button>
                <button className={`btn btn-sm ${tab === 'coupons' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('coupons')}>
                    <Ticket size={14} /> Kuponlar
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {tab === 'promos' ? (
                                <><th>Ad</th><th>Tür</th><th>Değer</th><th>Durum</th></>
                            ) : (
                                <><th>Kod</th><th>Promosyon</th><th>Kullanım</th><th>Durum</th></>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {tab === 'promos' && promos.map((p: any) => (
                            <tr key={p._id}>
                                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</td>
                                <td>{p.type}</td>
                                <td>{p.type === 'percentage' ? `%${p.value}` : `${p.value} TL`}</td>
                                <td><span className={`badge-status ${p.isActive ? 'badge-active' : 'badge-inactive'}`}>{p.isActive ? 'Aktif' : 'Pasif'}</span></td>
                            </tr>
                        ))}
                        {tab === 'coupons' && coupons.map((c: any) => (
                            <tr key={c._id}>
                                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>{c.code}</td>
                                <td>{c.promotionId?.name || '-'}</td>
                                <td>{c.usedCount}/{c.maxUses || '∞'}</td>
                                <td><span className={`badge-status ${c.isActive ? 'badge-active' : 'badge-inactive'}`}>{c.isActive ? 'Aktif' : 'Pasif'}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
