// app/products/page.tsx
'use client'

import { ProductContent } from '@/components/product/product-content'
import { Suspense } from 'react'

export default function ProductsPage() {
    return (
        <Suspense fallback={<ProductsLoading />}>
            <ProductContent />
        </Suspense>
    )
}

function ProductsLoading() {
    return (
        <div className="min-h-screen bg-zinc-50 md:mt-38">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <div className="h-12 bg-zinc-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
                    <div className="h-4 bg-zinc-200 rounded w-96 mx-auto animate-pulse"></div>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-64 space-y-6">
                        {/* Loading skeleton for filters */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-zinc-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                    <div className="flex-1">
                        <div className="h-8 bg-zinc-200 rounded w-full mb-6 animate-pulse"></div>
                        {/* Loading skeleton for product grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-80 bg-zinc-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}