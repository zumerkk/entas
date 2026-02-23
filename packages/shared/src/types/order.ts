export interface OrderDto {
    orderNumber: string;
    status: OrderStatus;
    items: OrderItemDto[];
    subtotal: number;
    vatTotal: number;
    discount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    shippingAddress: AddressDto;
    billingAddress?: AddressDto;
    notes?: string;
}

export interface OrderItemDto {
    productId: string;
    sku: string;
    title: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    vatRate: number;
}

export interface AddressDto {
    fullAddress: string;
    city?: string;
    district?: string;
    postalCode?: string;
    phone?: string;
    contactName?: string;
}

export type OrderStatus =
    | 'pending' | 'confirmed' | 'processing'
    | 'shipped' | 'delivered' | 'cancelled'
    | 'refunded' | 'quote_requested';

export type PaymentMethod = 'transfer' | 'credit_card' | 'on_delivery' | 'credit';

export interface CheckoutDto {
    shippingAddress: AddressDto;
    billingAddress?: AddressDto;
    paymentMethod: PaymentMethod;
    notes?: string;
    couponCode?: string;
    idempotencyKey?: string;
}

export interface ShipmentDto {
    trackingNumber: string;
    carrier: string;
    status: ShipmentStatus;
    orderId: string;
    statusHistory: ShipmentEvent[];
}

export interface ShipmentEvent {
    status: ShipmentStatus;
    date: string;
    notes?: string;
}

export type ShipmentStatus = 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'returned';

export interface PromotionDto {
    name: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    minOrderAmount?: number;
}

export interface CouponDto {
    code: string;
    promotionId: string;
    maxUses?: number;
    usedCount: number;
    isActive: boolean;
}

export interface SettingDto {
    key: string;
    value: unknown;
    type: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
}

export interface FeatureFlagDto {
    key: string;
    enabled: boolean;
    description?: string;
}

export interface ImportJobDto {
    fileName: string;
    type: 'product' | 'stock';
    status: 'pending' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
    totalRows: number;
    successRows: number;
    errorRows: number;
}

export interface DashboardStats {
    orders: { total: number; monthly: number; pending: number };
    revenue: { monthly: number };
    customers: { total: number };
    products: { active: number };
    inventory: { lowStockAlerts: number };
}
