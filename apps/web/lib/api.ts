const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class StoreApi {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') localStorage.setItem('entec_token', token);
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') this.token = localStorage.getItem('entec_token');
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('entec_token');
            localStorage.removeItem('entec_refresh');
        }
    }

    async request<T = any>(endpoint: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const config: RequestInit = { method: opts.method || 'GET', headers };
        if (opts.body) config.body = JSON.stringify(opts.body);

        const res = await fetch(`${API_BASE}${endpoint}`, config);
        if (res.status === 401) { this.clearToken(); if (typeof window !== 'undefined') window.location.href = '/login'; throw new Error('Oturum doldu'); }
        if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || `HTTP ${res.status}`); }
        return res.json();
    }

    // Auth
    login(email: string, password: string) { return this.request('/auth/login', { method: 'POST', body: { email, password } }); }
    register(data: any) { return this.request('/auth/register', { method: 'POST', body: data }); }
    me() { return this.request('/auth/me'); }

    // Products
    products(params = '') { return this.request(`/products${params ? '?' + params : ''}`); }
    product(slug: string) { return this.request(`/products/slug/${slug}`); }
    productById(id: string) { return this.request(`/products/${id}`); }

    // Categories
    categories() { return this.request('/categories'); }
    categoryBySlug(slug: string) { return this.request(`/categories/slug/${slug}`); }

    // Brands
    brands() { return this.request('/brands'); }

    // Search
    search(q: string, params = '') { return this.request(`/search?q=${encodeURIComponent(q)}${params ? '&' + params : ''}`); }
    suggest(q: string) { return this.request(`/search/suggest?q=${encodeURIComponent(q)}`); }

    // Pricing
    productPrice(id: string) { return this.request(`/pricing/product/${id}`); }
    guestPrice(id: string) { return this.request(`/pricing/product/${id}/guest`); }

    // Cart
    getCart() { return this.request('/cart'); }
    cartSummary() { return this.request('/cart/summary'); }
    addToCart(productId: string, quantity: number) { return this.request('/cart/items', { method: 'POST', body: { productId, quantity } }); }
    updateCartItem(productId: string, quantity: number) { return this.request(`/cart/items/${productId}`, { method: 'PUT', body: { quantity } }); }
    removeCartItem(productId: string) { return this.request(`/cart/items/${productId}`, { method: 'DELETE' }); }
    clearCart() { return this.request('/cart', { method: 'DELETE' }); }

    // Orders
    checkout(data: any) { return this.request('/orders/checkout', { method: 'POST', body: data }); }
    myOrders(page = 1) { return this.request(`/orders?page=${page}`); }
    order(id: string) { return this.request(`/orders/${id}`); }
    reorder(id: string) { return this.request(`/orders/${id}/reorder`, { method: 'POST' }); }

    // Coupons
    validateCoupon(code: string) { return this.request('/promotions/coupons/validate', { method: 'POST', body: { code } }); }

    // Shipment track
    trackShipment(trackingNumber: string) { return this.request(`/shipments/track/${trackingNumber}`); }
}

export const api = new StoreApi();
export default api;
