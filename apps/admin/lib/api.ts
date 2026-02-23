const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

class ApiClient {
    private token: string | null = null;

    setToken(token: string) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('entec_admin_token', token);
        }
    }

    getToken(): string | null {
        if (!this.token && typeof window !== 'undefined') {
            this.token = localStorage.getItem('entec_admin_token');
        }
        return this.token;
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('entec_admin_token');
            localStorage.removeItem('entec_admin_refresh');
        }
    }

    async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const res = await fetch(`${API_BASE}${endpoint}`, config);

        if (res.status === 401) {
            this.clearToken();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error('Oturum süresi doldu');
        }

        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'Bir hata oluştu' }));
            throw new Error(error.message || `HTTP ${res.status}`);
        }

        return res.json();
    }

    // Auth
    login(email: string, password: string) {
        return this.request('/auth/login', { method: 'POST', body: { email, password } });
    }

    me() {
        return this.request('/auth/me');
    }

    // Dashboard
    dashboard() {
        return this.request('/reports/dashboard');
    }

    revenueReport(period = 'daily', days = 30) {
        return this.request(`/reports/revenue?period=${period}&days=${days}`);
    }

    topProducts(limit = 20) {
        return this.request(`/reports/top-products?limit=${limit}`);
    }

    topCustomers(limit = 20) {
        return this.request(`/reports/top-customers?limit=${limit}`);
    }

    // Products
    products(params = '') {
        return this.request(`/products${params ? '?' + params : ''}`);
    }

    product(id: string) {
        return this.request(`/products/${id}`);
    }

    createProduct(data: any) {
        return this.request('/products', { method: 'POST', body: data });
    }

    updateProduct(id: string, data: any) {
        return this.request(`/products/${id}`, { method: 'PUT', body: data });
    }

    deleteProduct(id: string) {
        return this.request(`/products/${id}`, { method: 'DELETE' });
    }

    // Categories
    categories(flat = true) {
        return this.request(`/categories?flat=${flat}`);
    }

    createCategory(data: any) {
        return this.request('/categories', { method: 'POST', body: data });
    }

    // Brands
    brands() {
        return this.request('/brands');
    }

    // Customers
    customers(params = '') {
        return this.request(`/customers${params ? '?' + params : ''}`);
    }

    customer(id: string) {
        return this.request(`/customers/${id}`);
    }

    // Orders
    orders(params = '') {
        return this.request(`/orders/admin${params ? '?' + params : ''}`);
    }

    order(id: string) {
        return this.request(`/orders/${id}`);
    }

    updateOrderStatus(id: string, status: string, notes?: string) {
        return this.request(`/orders/${id}/status`, { method: 'PUT', body: { status, internalNotes: notes } });
    }

    // Inventory
    productStock(productId: string) {
        return this.request(`/inventory/product/${productId}`);
    }

    lowStockAlerts() {
        return this.request('/inventory/alerts');
    }

    // Import
    importJobs(params = '') {
        return this.request(`/import/jobs${params ? '?' + params : ''}`);
    }

    // Settings
    settings() {
        return this.request('/settings');
    }

    upsertSetting(key: string, value: any) {
        return this.request(`/settings/${key}`, { method: 'PUT', body: { value } });
    }

    featureFlags() {
        return this.request('/settings/flags/all');
    }

    // Shipments
    shipments(params = '') {
        return this.request(`/shipments${params ? '?' + params : ''}`);
    }

    // Audit
    recentActivity(limit = 50) {
        return this.request(`/reports/activity?limit=${limit}`);
    }

    // Promotions
    promotions(params = '') {
        return this.request(`/promotions${params ? '?' + params : ''}`);
    }

    createPromotion(data: any) {
        return this.request('/promotions', { method: 'POST', body: data });
    }

    updatePromotion(id: string, data: any) {
        return this.request(`/promotions/${id}`, { method: 'PUT', body: data });
    }

    deletePromotion(id: string) {
        return this.request(`/promotions/${id}`, { method: 'DELETE' });
    }

    coupons(params = '') {
        return this.request(`/promotions/coupons${params ? '?' + params : ''}`);
    }

    // Brands CRUD
    createBrand(data: any) {
        return this.request('/brands', { method: 'POST', body: data });
    }

    updateBrand(id: string, data: any) {
        return this.request(`/brands/${id}`, { method: 'PUT', body: data });
    }

    deleteBrand(id: string) {
        return this.request(`/brands/${id}`, { method: 'DELETE' });
    }

    // Categories CRUD
    updateCategory(id: string, data: any) {
        return this.request(`/categories/${id}`, { method: 'PUT', body: data });
    }

    deleteCategory(id: string) {
        return this.request(`/categories/${id}`, { method: 'DELETE' });
    }

    // Customers CRUD
    createCustomer(data: any) {
        return this.request('/customers', { method: 'POST', body: data });
    }

    updateCustomer(id: string, data: any) {
        return this.request(`/customers/${id}`, { method: 'PUT', body: data });
    }

    // Feature flags toggle
    toggleFlag(key: string, enabled: boolean) {
        return this.request(`/settings/flags/${key}`, { method: 'PUT', body: { enabled } });
    }

    // Webhooks
    webhooks() {
        return this.request('/webhooks');
    }

    // Notifications
    notifications(params = '') {
        return this.request(`/notifications${params ? '?' + params : ''}`);
    }

    // Media
    mediaList(params = '') {
        return this.request(`/media${params ? '?' + params : ''}`);
    }

    // Search
    search(q: string) {
        return this.request(`/search?q=${encodeURIComponent(q)}`);
    }
}

export const api = new ApiClient();
export default api;
