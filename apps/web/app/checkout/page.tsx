'use client';

import { useState } from 'react';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { ArrowRight, CreditCard, Truck, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        shippingAddress: '', billingAddress: '', paymentMethod: 'transfer',
        notes: '', couponCode: '',
    });
    const [couponMsg, setCouponMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const update = (key: string, val: string) => setForm({ ...form, [key]: val });

    const applyCoupon = async () => {
        if (!form.couponCode) return;
        try {
            await api.validateCoupon(form.couponCode);
            setCouponMsg('Kupon uygulandı ✓');
        } catch (e: any) { setCouponMsg(e.message || 'Geçersiz kupon'); }
    };

    const handleCheckout = async () => {
        if (!form.shippingAddress) { setError('Teslimat adresi gerekli'); return; }
        setLoading(true); setError('');
        try {
            const res = await api.checkout({
                shippingAddress: { fullAddress: form.shippingAddress },
                billingAddress: { fullAddress: form.billingAddress || form.shippingAddress },
                paymentMethod: form.paymentMethod,
                notes: form.notes,
                couponCode: form.couponCode || undefined,
            });
            router.push(`/orders?success=${res.orderNumber || 'true'}`);
        } catch (e: any) { setError(e.message); }
        setLoading(false);
    };

    return (
        <StoreLayout>
            <section className="section">
                <div className="container" style={{ maxWidth: 680 }}>
                    <h2 className="section-title">Sipariş Tamamla</h2>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
                        {/* Adres */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <Truck size={18} color="var(--primary)" /> <h3 style={{ fontSize: 16, fontWeight: 700 }}>Teslimat Bilgileri</h3>
                        </div>
                        <div className="form-group">
                            <label>Teslimat Adresi *</label>
                            <textarea className="form-control" rows={3} value={form.shippingAddress} onChange={(e) => update('shippingAddress', e.target.value)} placeholder="Tam adres..." />
                        </div>
                        <div className="form-group">
                            <label>Fatura Adresi (farklıysa)</label>
                            <textarea className="form-control" rows={2} value={form.billingAddress} onChange={(e) => update('billingAddress', e.target.value)} placeholder="Boş bırakırsanız teslimat adresi kullanılır" />
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                        {/* Ödeme */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                            <CreditCard size={18} color="var(--primary)" /> <h3 style={{ fontSize: 16, fontWeight: 700 }}>Ödeme</h3>
                        </div>
                        <div className="form-group">
                            <label>Ödeme Yöntemi</label>
                            <select className="form-control" value={form.paymentMethod} onChange={(e) => update('paymentMethod', e.target.value)}>
                                <option value="transfer">Havale / EFT</option>
                                <option value="credit_card">Kredi Kartı</option>
                                <option value="on_delivery">Kapıda Ödeme</option>
                            </select>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

                        {/* Kupon */}
                        <div className="form-group">
                            <label>Kupon Kodu</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input className="form-control" value={form.couponCode} onChange={(e) => update('couponCode', e.target.value)} placeholder="INDIRIM20" />
                                <button className="btn btn-outline" type="button" onClick={applyCoupon}>Uygula</button>
                            </div>
                            {couponMsg && <div style={{ fontSize: 13, marginTop: 6, color: couponMsg.includes('✓') ? 'var(--success)' : 'var(--danger)' }}>{couponMsg}</div>}
                        </div>

                        {/* Notlar */}
                        <div className="form-group">
                            <label><FileText size={14} style={{ marginRight: 4 }} /> Sipariş Notu</label>
                            <textarea className="form-control" rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Opsiyonel..." />
                        </div>

                        <button className="btn btn-primary btn-block" style={{ padding: 16, fontSize: 16, marginTop: 16 }} onClick={handleCheckout} disabled={loading}>
                            {loading ? 'İşleniyor...' : 'Siparişi Onayla'} <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
