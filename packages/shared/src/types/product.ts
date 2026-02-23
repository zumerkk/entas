/**
 * Product & Catalog types
 */

export interface ProductBase {
    sku: string;
    barcode?: string;
    title: string;
    slug: string;
    description?: string;
    brandId?: string;
    categoryIds: string[];
    basePrice: number;
    currency: string;
    unit: string;
    packSize?: number;
    minOrderQuantity?: number;
    attributes: Record<string, string | number | boolean>;
    images: ProductImage[];
    isActive: boolean;
    isFeatured?: boolean;
}

export interface ProductImage {
    url: string;
    alt: string;
    sortOrder: number;
    isThumbnail: boolean;
}

export interface ProductVariantBase {
    productId: string;
    sku: string;
    barcode?: string;
    title: string;
    attributes: Record<string, string | number | boolean>;
    priceModifier?: number;
    isActive: boolean;
}

export interface CategoryBase {
    name: string;
    slug: string;
    parentId?: string;
    sortOrder: number;
    isActive: boolean;
    image?: string;
}

export interface BrandBase {
    name: string;
    slug: string;
    logo?: string;
    isActive: boolean;
}

/** Quantity break pricing */
export interface QuantityBreak {
    minQty: number;
    price: number;
}
