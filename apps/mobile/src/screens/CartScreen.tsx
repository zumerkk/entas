import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../api';

export default function CartScreen() {
    const [cart, setCart] = useState<any>(null);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            const [c, s] = await Promise.all([api.getCart(), api.cartSummary()]);
            setCart(c); setSummary(s);
        } catch { }
        setLoading(false);
    };

    useFocusEffect(useCallback(() => { fetchCart(); }, []));

    const removeItem = async (productId: string) => {
        try { await api.removeCartItem(productId); fetchCart(); } catch { }
    };

    const handleCheckout = async () => {
        Alert.alert('Sipariş', 'Siparişi onaylıyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            {
                text: 'Onayla', onPress: async () => {
                    try {
                        await api.checkout({ paymentMethod: 'transfer' });
                        Alert.alert('Başarılı', 'Siparişiniz oluşturuldu!');
                        fetchCart();
                    } catch (err: any) { Alert.alert('Hata', err.message); }
                },
            },
        ]);
    };

    const fmt = (v: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    if (loading) return <View style={s.center}><ActivityIndicator size="large" color="#4f46e5" /></View>;

    return (
        <View style={s.container}>
            {!cart?.items?.length ? (
                <View style={s.center}>
                    <Text style={s.emptyTitle}>Sepetiniz Boş</Text>
                    <Text style={s.emptyText}>Ürün eklemek için mağazayı gezin</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cart.items}
                        keyExtractor={(item: any) => item.productId}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <View style={s.item}>
                                <View style={{ flex: 1 }}>
                                    <Text style={s.itemTitle}>Ürün #{item.productId.toString().slice(-6)}</Text>
                                    <Text style={s.itemQty}>Adet: {item.quantity} × {fmt(item.unitPrice || 0)}</Text>
                                </View>
                                <Text style={s.itemTotal}>{fmt((item.unitPrice || 0) * item.quantity)}</Text>
                                <TouchableOpacity onPress={() => removeItem(item.productId)} style={s.removeBtn}>
                                    <Text style={s.removeBtnText}>Sil</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                    <View style={s.summaryBox}>
                        <View style={s.summaryRow}>
                            <Text style={s.summaryLabel}>Ara Toplam</Text>
                            <Text style={s.summaryValue}>{fmt(summary?.subtotal || 0)}</Text>
                        </View>
                        <View style={s.summaryRow}>
                            <Text style={s.summaryLabel}>KDV</Text>
                            <Text style={s.summaryValue}>{fmt(summary?.vatTotal || 0)}</Text>
                        </View>
                        <View style={[s.summaryRow, { borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 12, marginTop: 4 }]}>
                            <Text style={[s.summaryLabel, { fontWeight: '800', fontSize: 18, color: '#111' }]}>Toplam</Text>
                            <Text style={[s.summaryValue, { fontWeight: '800', fontSize: 18, color: '#4f46e5' }]}>{fmt(summary?.grandTotal || 0)}</Text>
                        </View>
                        <TouchableOpacity style={s.checkoutBtn} onPress={handleCheckout}>
                            <Text style={s.checkoutBtnText}>Siparişi Tamamla</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyTitle: { fontSize: 22, fontWeight: '700', color: '#374151', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#9ca3af' },
    item: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', gap: 12 },
    itemTitle: { fontWeight: '600', fontSize: 15, color: '#111' },
    itemQty: { fontSize: 13, color: '#6b7280', marginTop: 4 },
    itemTotal: { fontWeight: '700', fontSize: 16 },
    removeBtn: { backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    removeBtnText: { color: '#dc2626', fontWeight: '600', fontSize: 12 },
    summaryBox: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', padding: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#6b7280' },
    summaryValue: { fontSize: 14, fontWeight: '600' },
    checkoutBtn: { backgroundColor: '#4f46e5', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 12 },
    checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
