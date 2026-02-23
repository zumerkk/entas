import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import api from '../api';

export default function CategoriesScreen({ navigation }: any) {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        api.categories().then((res) => setCategories(Array.isArray(res) ? res : [])).catch(() => { });
    }, []);

    return (
        <View style={s.container}>
            <FlatList
                data={categories}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={{ padding: 12 }}
                columnWrapperStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={s.card}>
                        <Text style={s.icon}>📦</Text>
                        <Text style={s.name} numberOfLines={2}>{item.name}</Text>
                        {item.children?.length > 0 && (
                            <Text style={s.sub}>{item.children.length} alt kategori</Text>
                        )}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={s.center}>
                        <Text style={s.emptyText}>Kategori bulunamadı</Text>
                    </View>
                }
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 16, color: '#9ca3af' },
    card: {
        flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 20,
        marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb',
        alignItems: 'center', justifyContent: 'center', minHeight: 120,
    },
    icon: { fontSize: 28, marginBottom: 8 },
    name: { fontSize: 14, fontWeight: '600', color: '#111', textAlign: 'center' },
    sub: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
});
