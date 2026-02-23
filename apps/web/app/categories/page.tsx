'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StoreLayout from '../../components/StoreLayout';
import api from '../../lib/api';
import { Package } from 'lucide-react';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        api.categories().then((res) => setCategories(Array.isArray(res) ? res : [])).catch(() => { });
    }, []);

    return (
        <StoreLayout>
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Tüm Kategoriler</h2>
                    <div className="category-grid">
                        {categories.map((cat: any) => (
                            <Link key={cat._id} href={`/products?category=${cat._id}`} className="category-card">
                                <div className="category-card-icon"><Package size={22} /></div>
                                <div className="category-card-name">{cat.name}</div>
                                {cat.children?.length > 0 && (
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                        {cat.children.length} alt kategori
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </StoreLayout>
    );
}
