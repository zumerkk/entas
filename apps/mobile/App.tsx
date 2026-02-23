import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import api from './src/api';

const Tab = createBottomTabNavigator();

const icons: Record<string, string> = {
    Ürünler: '📦', Sepet: '🛒', Siparişler: '📋', Profil: '👤',
};

export default function App() {
    const [loggedIn, setLoggedIn] = useState(!!api.getToken());

    if (!loggedIn) {
        return (
            <>
                <StatusBar style="light" />
                <LoginScreen onLogin={() => setLoggedIn(true)} />
            </>
        );
    }

    return (
        <NavigationContainer>
            <StatusBar style="dark" />
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: () => <Text style={{ fontSize: 20 }}>{icons[route.name] || '📌'}</Text>,
                    tabBarActiveTintColor: '#4f46e5',
                    tabBarInactiveTintColor: '#9ca3af',
                    tabBarStyle: {
                        backgroundColor: '#ffffff',
                        borderTopColor: '#e5e7eb',
                        height: 85,
                        paddingBottom: 28,
                        paddingTop: 8,
                    },
                    tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
                    headerStyle: { backgroundColor: '#ffffff', shadowColor: '#e5e7eb' },
                    headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                })}
            >
                <Tab.Screen name="Ürünler" component={ProductsScreen} />
                <Tab.Screen name="Sepet" component={CartScreen} />
                <Tab.Screen name="Siparişler" component={OrdersScreen} />
                <Tab.Screen
                    name="Profil"
                    children={() => <ProfileScreen onLogout={() => setLoggedIn(false)} />}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
