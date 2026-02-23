'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../lib/api';
import { Settings as SettingsIcon, Flag, Save, Plus } from 'lucide-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState<any[]>([]);
    const [flags, setFlags] = useState<any[]>([]);
    const [tab, setTab] = useState<'settings' | 'flags'>('settings');

    useEffect(() => {
        api.settings().then((res) => setSettings(Array.isArray(res) ? res : [])).catch(() => { });
        api.featureFlags().then((res) => setFlags(Array.isArray(res) ? res : [])).catch(() => { });
    }, []);

    const toggleFlag = async (key: string, enabled: boolean) => {
        try {
            await api.request(`/settings/flags/${key}`, { method: 'PUT', body: { enabled: !enabled } });
            setFlags(flags.map((f) => f.key === key ? { ...f, enabled: !enabled } : f));
        } catch { }
    };

    return (
        <AdminLayout>
            <div className="page-header">
                <div><h2>Ayarlar</h2><p>Sistem yapılandırması ve feature flags</p></div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`btn btn-sm ${tab === 'settings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('settings')}>
                    <SettingsIcon size={14} /> Ayarlar
                </button>
                <button className={`btn btn-sm ${tab === 'flags' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab('flags')}>
                    <Flag size={14} /> Feature Flags
                </button>
            </div>

            {tab === 'settings' && (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Anahtar</th><th>Değer</th><th>Tür</th><th>Açıklama</th></tr></thead>
                        <tbody>
                            {settings.map((s: any) => (
                                <tr key={s.key}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent)' }}>{s.key}</td>
                                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>{JSON.stringify(s.value)}</td>
                                    <td>{s.type || typeof s.value}</td>
                                    <td>{s.description || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'flags' && (
                <div className="table-container">
                    <table>
                        <thead><tr><th>Flag</th><th>Açıklama</th><th>Durum</th><th></th></tr></thead>
                        <tbody>
                            {flags.map((f: any) => (
                                <tr key={f.key}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{f.key}</td>
                                    <td>{f.description || '-'}</td>
                                    <td>
                                        <span className={`badge-status ${f.enabled ? 'badge-active' : 'badge-inactive'}`}>
                                            {f.enabled ? 'Açık' : 'Kapalı'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-outline" onClick={() => toggleFlag(f.key, f.enabled)}>
                                            {f.enabled ? 'Kapat' : 'Aç'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}
