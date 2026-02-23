/**
 * Customer (B2B) types
 */

export type PaymentType = 'wire_transfer' | 'credit_card' | 'deferred';

export interface CustomerAddress {
    label: string;
    line1: string;
    line2?: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export interface CustomerBase {
    companyName: string;
    taxOffice?: string;
    taxNumber?: string;
    accountCode?: string;
    paymentType: PaymentType;
    creditLimit?: number;
    openBalance?: number;
    riskScore?: number;
    salesRepId?: string;
    deliveryAddresses: CustomerAddress[];
    branchAddresses: CustomerAddress[];
    isActive: boolean;
}

export interface CustomerGroupBase {
    name: string;
    description?: string;
    priceListId?: string;
}
