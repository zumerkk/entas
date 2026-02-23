import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import api from '../api';

export default function ProfileScreen({ onLogout }: { onLogout: () => void }) {
    const [user, setUser] = useState<any>(null);

    React.useEffect(() => {
        api.me().then(setUser).catch(() => { });
    }, []);

    const handleLogout = () => {
        Alert.alert('Çıkış', 'Çıkış yapmak istediğinize emin misiniz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış', style: 'destructive', onPress: () => { api.clearToken(); onLogout(); } },
        ]);
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <View style={s.avatar}>
                    <Text style={s.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
                </View>
                <Text style={s.name}>{user?.firstName} {user?.lastName}</Text>
                <Text style={s.email}>{user?.email}</Text>
                <Text style={s.role}>{user?.role}</Text>
            </View>

            <View style={s.menu}>
                {[
                    { title: 'Hesap Bilgileri', icon: '👤' },
                    { title: 'Adres Yönetimi', icon: '📍' },
                    { title: 'Bildirim Ayarları', icon: '🔔' },
                    { title: 'Kargo Takip', icon: '📦' },
                    { title: 'Yardım & Destek', icon: '💬' },
                ].map((item, i) => (
                    <TouchableOpacity key={i} style={s.menuItem}>
                        <Text style={s.menuIcon}>{item.icon}</Text>
                        <Text style={s.menuTitle}>{item.title}</Text>
                        <Text style={s.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                <Text style={s.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    header: { backgroundColor: '#1e1b4b', paddingTop: 60, paddingBottom: 32, alignItems: 'center' },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
    name: { color: '#fff', fontSize: 22, fontWeight: '700' },
    email: { color: '#a5b4fc', fontSize: 14, marginTop: 4 },
    role: { color: '#818cf8', fontSize: 12, marginTop: 4, textTransform: 'uppercase', fontWeight: '600' },
    menu: { padding: 16 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    menuIcon: { fontSize: 20, marginRight: 12 },
    menuTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: '#111' },
    menuArrow: { fontSize: 20, color: '#9ca3af' },
    logoutBtn: { marginHorizontal: 16, backgroundColor: '#fef2f2', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#fecaca' },
    logoutText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },
});
