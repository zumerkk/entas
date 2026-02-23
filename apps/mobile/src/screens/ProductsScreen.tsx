import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, TextInput,
    StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import api from '../api';

export default function ProductsScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const fetchProducts = async (p = 1, refresh = false) => {
        if (refresh) setRefreshing(true); else setLoading(true);
        try {
            const res = search
                ? await api.search(search)
                : await api.products(p);
            setProducts(p === 1 ? (res.data || []) : [...products, ...(res.data || [])]);
        } catch { }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleSearch = () => { setPage(1); fetchProducts(1); };

    const formatPrice = (v: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v);

    const addToCart = async (productId: string) => {
        try {
            await api.addToCart(productId, 1);
        } catch { }
    };

    return (
        <View style={s.container}>
            <View style={s.searchBar}>
                <TextInput
                    style={s.searchInput} placeholder="Ürün ara..." placeholderTextColor="#9ca3af"
                    value={search} onChangeText={setSearch} onSubmitEditing={handleSearch} returnKeyType="search"
                />
            </View>

            {loading ? <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(1, true)} tintColor="#4f46e5" />}
                    contentContainerStyle={{ padding: 16 }}
                    renderItem={({ item }) => (
                        <View style={s.card}>
                            <View style={s.cardBody}>
                                <Text style={s.sku}>{item.sku}</Text>
                                <Text style={s.name} numberOfLines={2}>{item.title}</Text>
                                <View style={s.row}>
                                    <Text style={s.price}>{formatPrice(item.basePrice)}</Text>
                                    <Text style={s.vat}>+KDV %{item.vatRate || 20}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={s.addBtn} onPress={() => addToCart(item._id)}>
                                <Text style={s.addBtnText}>+ Sepete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    onEndReached={() => { setPage(page + 1); fetchProducts(page + 1); }}
                    onEndReachedThreshold={0.5}
                />
            )}
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    searchBar: { padding: 16, paddingTop: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    searchInput: { backgroundColor: '#f3f4f6', borderRadius: 12, padding: 12, fontSize: 15, color: '#111' },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center' },
    cardBody: { flex: 1 },
    sku: { fontSize: 11, fontFamily: 'monospace', color: '#9ca3af', marginBottom: 4 },
    name: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 8, lineHeight: 20 },
    row: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
    price: { fontSize: 18, fontWeight: '800', color: '#4f46e5' },
    vat: { fontSize: 11, color: '#9ca3af' },
    addBtn: { backgroundColor: '#4f46e5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
