const API_BASE = 'http://localhost:3001/api';

class MobileApi {
    private token: string | null = null;

    setToken(t: string) { this.token = t; }
    getToken() { return this.token; }
    clearToken() { this.token = null; }

    async request<T = any>(endpoint: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

        const config: RequestInit = { method: opts.method || 'GET', headers };
        if (opts.body) config.body = JSON.stringify(opts.body);

        const res = await fetch(`${API_BASE}${endpoint}`, config);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }
        return res.json();
    }

    login(email: string, password: string) { return this.request('/auth/login', { method: 'POST', body: { email, password } }); }
    me() { return this.request('/auth/me'); }
    products(page = 1) { return this.request(`/products?page=${page}&limit=20`); }
    product(id: string) { return this.request(`/products/${id}`); }
    categories() { return this.request('/categories'); }
    search(q: string) { return this.request(`/search?q=${encodeURIComponent(q)}`); }
    getCart() { return this.request('/cart'); }
    addToCart(productId: string, qty: number) { return this.request('/cart/items', { method: 'POST', body: { productId, quantity: qty } }); }
    removeCartItem(productId: string) { return this.request(`/cart/items/${productId}`, { method: 'DELETE' }); }
    cartSummary() { return this.request('/cart/summary'); }
    checkout(data: any) { return this.request('/orders/checkout', { method: 'POST', body: data }); }
    myOrders(page = 1) { return this.request(`/orders?page=${page}`); }
    guestPrice(id: string) { return this.request(`/pricing/product/${id}/guest`); }
}

export const api = new MobileApi();
export default api;
