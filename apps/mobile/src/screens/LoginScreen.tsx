import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import api from '../api';

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) { Alert.alert('Hata', 'E-posta ve şifre gerekli'); return; }
        setLoading(true);
        try {
            const res = await api.login(email, password);
            api.setToken(res.accessToken);
            onLogin();
        } catch (err: any) {
            Alert.alert('Giriş Başarısız', err.message || 'Bir hata oluştu');
        }
        setLoading(false);
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={s.header}>
                <Text style={s.logo}>ENTAŞ</Text>
                <Text style={s.subtitle}>B2B Mobil</Text>
            </View>
            <View style={s.form}>
                <Text style={s.title}>Giriş Yap</Text>
                <TextInput
                    style={s.input} placeholder="E-posta" placeholderTextColor="#94a3b8"
                    value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
                />
                <TextInput
                    style={s.input} placeholder="Şifre" placeholderTextColor="#94a3b8"
                    value={password} onChangeText={setPassword} secureTextEntry
                />
                <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={s.buttonText}>Giriş Yap</Text>}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1b4b' },
    header: { paddingTop: 100, paddingBottom: 40, alignItems: 'center' },
    logo: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -1 },
    subtitle: { fontSize: 16, color: '#a5b4fc', marginTop: 8 },
    form: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 32 },
    title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 28 },
    input: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', fontSize: 16, color: '#111' },
    button: { backgroundColor: '#4f46e5', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
