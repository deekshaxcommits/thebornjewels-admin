export interface ProductImage {
    url: string;
    key: string;
    _id?: string;
    type?: "image" | "video"; // auto-detect from extension
}

export interface ProductMeta {
    occasion: string[];
    style: string[];
}

export interface Product {
    _id: string;
    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    category: string;
    material: string;
    stock?: number;
    sku?: string;
    images: ProductImage[];
    features?: string[];
    specifications?: Record<string, string>;
    meta?: ProductMeta;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    inStock?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
