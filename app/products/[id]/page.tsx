// app/products/[id]/page.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Product } from "@/types/product";
import { getProductByID } from "@/lib/api/products";


export default function ProductPage() {
    const params = useParams();
    const id = params?.id as string;

    const {
        data: product,
        isLoading,
        isError,
    } = useQuery<Product>({
        queryKey: ["product", id],
        queryFn: () => getProductByID(id),
        enabled: Boolean(id),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (isError || !product) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-42">
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-zinc-500 mb-8">
                    <Link href="/" className="hover:text-zinc-700">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/products" className="hover:text-zinc-700">
                        Products
                    </Link>
                    <span>/</span>
                    <span className="text-zinc-900">{product.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-4">
                        <div className="aspect-square relative rounded-lg overflow-hidden bg-zinc-50">
                            <Image
                                src={product.images?.[0].url || "/placeholder.jpg"}
                                alt={product.title}
                                fill
                                className="object-cover object-center"
                            />
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {product.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="aspect-square relative rounded-md overflow-hidden bg-zinc-50"
                                    >
                                        <Image
                                            src={image.url}
                                            alt={`${product.title} view ${index + 1}`}
                                            fill
                                            className="object-cover object-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="flex gap-2">
                            {product.isNewArrival && (
                                <span className="bg-zinc-900 px-3 py-1 text-xs font-medium text-white rounded-full">
                                    New
                                </span>
                            )}
                            {product.isBestSeller && (
                                <span className="bg-amber-500 px-3 py-1 text-xs font-medium text-white rounded-full">
                                    Best Seller
                                </span>
                            )}
                        </div>

                        {/* Category */}
                        {product.category && (
                            <p className="text-sm text-zinc-500 uppercase tracking-wide">
                                {product.category}
                            </p>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-zinc-900">{product.title}</h1>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-zinc-900">
                                ₹{product.price.toFixed(2)}
                            </span>
                            {product.originalPrice && (
                                <span className="text-lg text-zinc-500 line-through">
                                    ₹{product.originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p className="text-zinc-600 leading-relaxed">{product.description}</p>
                        )}

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-zinc-900">Features</h3>
                                <ul className="grid grid-cols-2 gap-2">
                                    {product.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center text-sm text-zinc-600"
                                        >
                                            <svg
                                                className="w-4 h-4 text-green-500 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Specifications */}
                        {product.specifications && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-zinc-900">Specifications</h3>
                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className="flex">
                                            <dt className="text-zinc-500 capitalize w-24">{key}:</dt>
                                            <dd className="text-zinc-900">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div className="space-y-4">
                            <Button className="w-full" size="lg" disabled={!product.inStock}>
                                {product.inStock ? "Add to Cart" : "Out of Stock"}
                            </Button>

                            <Button variant="outline" className="w-full">
                                Add to Wishlist
                            </Button>
                        </div>

                        {/* Additional Info */}
                        <div className="border-t pt-6 space-y-4 text-sm text-zinc-600">
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                                Free shipping worldwide
                            </div>
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                                Secure payment
                            </div>
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 mr-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                Lifetime warranty
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
