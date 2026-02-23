'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { Search, Package } from 'lucide-react';

function SearchContent() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q') || '';
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (q) {
            setLoading(true);
            api.search(q).then((res) => setResults(res.data || res || [])).catch(() => { }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [q]);

    const formatCurrency = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    return (
        <>
            <h2 className="section-title">
                <Search size={22} style={{ marginRight: 8 }} />
                &quot;{q}&quot; için sonuçlar {!loading && `(${results.length})`}
            </h2>
            {loading ? (
                <p>Aranıyor...</p>
            ) : results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <Search size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>Sonuç bulunamadı</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Farklı bir arama terimi deneyin</p>
                </div>
            ) : (
                <div className="product-grid">
                    {results.map((p: any) => (
                        <Link key={p._id} href={`/products/${p.slug}`} className="product-card">
                            <div className="product-card-img"><Package size={40} /></div>
                            <div className="product-card-body">
                                <div className="product-card-sku">{p.sku}</div>
                                <div className="product-card-title">{p.title}</div>
                                <div className="product-card-price">{formatCurrency(p.basePrice)}</div>
                                <div className="product-card-vat">+KDV %{p.vatRate || 20}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}

export default function SearchPage() {
    return (
        <StoreLayout>
            <section className="section">
                <div className="container">
                    <Suspense fallback={<p>Yükleniyor...</p>}>
                        <SearchContent />
                    </Suspense>
                </div>
            </section>
        </StoreLayout>
    );
}
