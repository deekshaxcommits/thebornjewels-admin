export interface ProductImage {
    url: string;
    key: string;
    _id?: string;
    type?: "image" | "video";
}

/* -----------------------------
   Reviews
----------------------------- */
export interface ReviewImage {
    url: string;
    key: string;
}

export interface ProductReview {
    _id: string;
    user?: {
        _id: string;
        name: string;
        profile?: string;
    };
    name?: string;
    rating: number;
    comment?: string;
    images?: ReviewImage[];
    createdAt: string;
}

/* -----------------------------
   Metadata (occasion, style)
----------------------------- */
export interface ProductMeta {
    occasion: string[];
    style: string[];
}

/* -----------------------------
   Highlights Section
----------------------------- */
export interface HighlightDetail {
    title: string;
    value: string;
}

export interface ProductHighlights {
    details: HighlightDetail[];
    reasons: string[];
}

/* -----------------------------
   SEO
----------------------------- */
export interface ProductSEO {
    title?: string;
    description?: string;
    keywords?: string[];
}

/* -----------------------------
   MAIN PRODUCT INTERFACE
----------------------------- */
export interface Product {
    _id: string;

    title: string;
    description?: string;
    price: number;
    originalPrice?: number;
    category: string;
    material: string;
    stock: number;
    sku?: string;

    images: ProductImage[];

    // flags
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    isActive?: boolean;
    inStock?: boolean;

    // meta
    meta?: ProductMeta;

    // highlights
    highlights?: ProductHighlights;

    // reviews
    reviews?: ProductReview[];
    rating?: number;
    reviewsCount?: number;

    // care instructions
    careInstructions?: string[];

    // seo
    seo?: ProductSEO;

    // social tags
    socialTags?: string[];

    // admin-only pricing
    buyPrice?: number;
    gstPercent?: number;
    razorpayCutPercent?: number;
    deliveryFee?: number;

    totalCostBeforeMarkup?: number;
    calculatedSellingPrice?: number;

    createdAt?: string;
    updatedAt?: string;
}
