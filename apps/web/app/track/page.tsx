'use client';

import { useState } from 'react';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { Search, Truck, Package, MapPin, CheckCircle } from 'lucide-react';

export default function TrackPage() {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber.trim()) return;
        setLoading(true); setError(''); setShipment(null);
        try {
            const res = await api.trackShipment(trackingNumber);
            setShipment(res);
        } catch (err: any) {
            setError(err.message || 'Kargo bulunamadı');
        }
        setLoading(false);
    };

    const statusLabels: Record<string, string> = {
        preparing: 'Hazırlanıyor', shipped: 'Kargoya Verildi', in_transit: 'Taşımada', delivered: 'Teslim Edildi', returned: 'İade',
    };

    return (
        <StoreLayout>
            <section className="section">
                <div className="container" style={{ maxWidth: 600 }}>
                    <div style={{ textAlign: 'center', marginBottom: 40 }}>
                        <Truck size={48} color="var(--primary)" style={{ marginBottom: 16 }} />
                        <h2 className="section-title" style={{ margin: 0 }}>Kargo Takip</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Takip numaranızı girerek kargonuzu sorgulayın</p>
                    </div>

                    <form onSubmit={handleTrack} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
                        <input
                            className="form-control" value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Takip numarası girin..."
                            style={{ flex: 1, padding: 14 }}
                        />
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            <Search size={16} /> {loading ? 'Sorgulanıyor...' : 'Sorgula'}
                        </button>
                    </form>

                    {error && <div className="alert alert-danger">{error}</div>}

                    {shipment && (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }} className="animate-in">
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <CheckCircle size={40} color="var(--success)" style={{ marginBottom: 12 }} />
                                <h3 style={{ fontSize: 20, fontWeight: 700 }}>Kargo Bulundu</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Takip No</div>
                                    <div style={{ fontWeight: 700, fontFamily: 'monospace' }}>{shipment.trackingNumber}</div>
                                </div>
                                <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Kargo Firması</div>
                                    <div style={{ fontWeight: 700 }}>{shipment.carrier}</div>
                                </div>
                                <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Durum</div>
                                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{statusLabels[shipment.status] || shipment.status}</div>
                                </div>
                                <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 12 }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tarih</div>
                                    <div style={{ fontWeight: 700 }}>{new Date(shipment.updatedAt || shipment.createdAt).toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>

                            {shipment.statusHistory?.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Hareket Geçmişi</h4>
                                    {shipment.statusHistory.map((h: any, i: number) => (
                                        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                                            <MapPin size={14} color="var(--primary)" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{statusLabels[h.status] || h.status}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(h.date).toLocaleString('tr-TR')}</div>
                                                {h.notes && <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>{h.notes}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </StoreLayout>
    );
}
