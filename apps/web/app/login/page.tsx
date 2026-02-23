'use client';

import { useState } from 'react';
import Link from 'next/link';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const res = await api.login(email, password);
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
                    <h1>Giriş Yap</h1>
                    <p>B2B hesabınıza erişin</p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>E-posta</label>
                            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="firma@email.com" required />
                        </div>
                        <div className="form-group">
                            <label>Şifre</label>
                            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            <LogIn size={18} /> {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
                        Hesabınız yok mu? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Kayıt Ol</Link>
                    </p>
                </div>
            </div>
        </StoreLayout>
    );
}
