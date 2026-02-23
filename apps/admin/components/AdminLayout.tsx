'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Package, FolderTree, Tag, Users, ShoppingCart,
    Truck, BarChart3, Settings, Upload, Gift, Bell, Shield,
    LogOut, ChevronDown, Menu, X,
} from 'lucide-react';
import api from '../lib/api';

const navSections = [
    {
        title: 'Ana Menü',
        items: [
            { href: '/', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/orders', label: 'Siparişler', icon: ShoppingCart },
            { href: '/customers', label: 'Müşteriler', icon: Users },
        ],
    },
    {
        title: 'Katalog',
        items: [
            { href: '/products', label: 'Ürünler', icon: Package },
            { href: '/categories', label: 'Kategoriler', icon: FolderTree },
            { href: '/brands', label: 'Markalar', icon: Tag },
        ],
    },
    {
        title: 'Operasyon',
        items: [
            { href: '/shipments', label: 'Sevkiyat', icon: Truck },
            { href: '/import', label: 'Toplu İşlem', icon: Upload },
            { href: '/promotions', label: 'Promosyonlar', icon: Gift },
        ],
    },
    {
        title: 'Sistem',
        items: [
            { href: '/reports', label: 'Raporlar', icon: BarChart3 },
            { href: '/settings', label: 'Ayarlar', icon: Settings },
        ],
    },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const token = api.getToken();
        if (token) {
            api.me().then(setUser).catch(() => { });
        }
    }, []);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname?.startsWith(href);
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <Shield size={24} color="#6366f1" />
                    <div>
                        <h1>ENTAŞ</h1>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navSections.map((section) => (
                        <div key={section.title} className="nav-section">
                            <div className="nav-section-title">{section.title}</div>
                            {section.items.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                {user && (
                    <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 700, color: 'white',
                        }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.firstName} {user.lastName}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.role}</div>
                        </div>
                        <button
                            onClick={() => { api.clearToken(); window.location.href = '/login'; }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                )}
            </aside>

            <main className="main-content animate-in">
                {children}
            </main>
        </div>
    );
}
