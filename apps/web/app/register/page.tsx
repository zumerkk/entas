'use client';

import { useState } from 'react';
import Link from 'next/link';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', companyName: '', phone: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const update = (k: string, v: string) => setForm({ ...form, [k]: v });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.firstName) { setError('Zorunlu alanları doldurun'); return; }
        setError(''); setLoading(true);
        try {
            const res = await api.register(form);
            api.setToken(res.accessToken);
            if (res.refreshToken) localStorage.setItem('entec_refresh', res.refreshToken);
            window.location.href = '/';
        } catch (err: any) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <StoreLayout>
            <div className="auth-container">
                <div className="auth-card animate-in">
                    <h1>Kayıt Ol</h1>
                    <p>B2B hesabınızı oluşturun</p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div className="form-group">
                                <label>Ad *</label>
                                <input className="form-control" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Soyad</label>
                                <input className="form-control" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Firma Adı</label>
                            <input className="form-control" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Opsiyonel" />
                        </div>
                        <div className="form-group">
                            <label>E-posta *</label>
                            <input type="email" className="form-control" value={form.email} onChange={(e) => update('email', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Telefon</label>
                            <input className="form-control" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="0 5xx xxx xx xx" />
                        </div>
                        <div className="form-group">
                            <label>Şifre *</label>
                            <input type="password" className="form-control" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={6} />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            <UserPlus size={18} /> {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
                        Zaten hesabınız var mı? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Giriş Yap</Link>
                    </p>
                </div>
            </div>
        </StoreLayout>
    );
}
