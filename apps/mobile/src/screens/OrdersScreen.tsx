import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import api from '../api';

const statusLabels: Record<string, string> = {
    pending: 'Bekliyor', confirmed: 'Onaylandı', processing: 'Hazırlanıyor',
    shipped: 'Kargoda', delivered: 'Teslim', cancelled: 'İptal',
};
const statusColors: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#6366f1', processing: '#3b82f6',
    shipped: '#10b981', delivered: '#059669', cancelled: '#ef4444',
};

export default function OrdersScreen() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async (refresh = false) => {
        if (refresh) setRefreshing(true); else setLoading(true);
        try { const res = await api.myOrders(); setOrders(res.data || []); } catch { }
        setLoading(false); setRefreshing(false);
    };

    useEffect(() => { fetchOrders(); }, []);

    const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <View style={s.container}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} />}
                ListEmptyComponent={
                    <View style={s.center}>
                        <Text style={s.emptyTitle}>Henüz siparişiniz yok</Text>
                        <Text style={s.emptyText}>Alışverişe başlayın!</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={s.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={s.orderNo}>{item.orderNumber}</Text>
                            <View style={[s.badge, { backgroundColor: (statusColors[item.status] || '#94a3b8') + '20' }]}>
                                <Text style={[s.badgeText, { color: statusColors[item.status] || '#94a3b8' }]}>
                                    {statusLabels[item.status] || item.status}
                                </Text>
                            </View>
                        </View>
                        <Text style={s.date}>{fmtDate(item.createdAt)} · {item.items?.length || 0} ürün</Text>
                        <Text style={s.total}>{fmt(item.grandTotal)}</Text>
                    </View>
                )}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#9ca3af' },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
    orderNo: { fontSize: 16, fontWeight: '700', color: '#111' },
    badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    date: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
    total: { fontSize: 20, fontWeight: '800', color: '#4f46e5' },
});
