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


            </div>
        </div>
    );
}