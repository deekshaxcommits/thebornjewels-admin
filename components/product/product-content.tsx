// components/product-content.tsx
'use client'

import { Switch } from '@headlessui/react'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Plus, Edit2, Trash2, Eye, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DM_Serif_Display } from "next/font/google"
import { useProducts } from '@/hooks/useProducts'
import { deactivateProduct, deleteProduct, getProducts, reactivateProduct } from '@/lib/api/products'
import { ProductModal } from './product-modal'
import { ProductDetailsModal } from './product-detail-model'
import { Product } from "@/types/product";


const dmFont = DM_Serif_Display({
    subsets: ["latin"],
    weight: "400",
})

const materials = [
    { id: 'all', name: 'All Materials' },
    { id: 'gold', name: 'Gold' },
    { id: 'silver', name: 'Silver' },
    { id: 'platinum', name: 'Platinum' },
    { id: 'rose-gold', name: 'Rose Gold' },
]

const sortOptions = [
    { id: 'newest', name: 'Newest' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'name', name: 'Name' },
]

export function ProductContent() {
    const searchParams = useSearchParams()
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedMaterial, setSelectedMaterial] = useState('all')
    const [sortBy, setSortBy] = useState('newest')
    const [priceRange, setPriceRange] = useState([0, 5000])
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState()
    const [editingProduct, setEditingProduct] = useState<string | null>(null)

    const { data: products = [], isLoading, isError, refetch } = useProducts()

    useEffect(() => {
        const search = searchParams.get('search')
        if (search) setSearchQuery(search)
    }, [searchParams])

    const allProducts = products || []

    // Compute categories dynamically
    const categories = useMemo(() => {
        const categoryMap = allProducts.reduce((acc: any, product: any) => {
            acc[product.category] = (acc[product.category] || 0) + 1
            return acc
        }, {})

        return [
            { id: 'all', name: 'All Products', count: allProducts.length },
            ...Object.keys(categoryMap).map((key) => ({
                id: key,
                name: key.charAt(0).toUpperCase() + key.slice(1),
                count: categoryMap[key],
            })),
        ]
    }, [allProducts])

    // Filter & sort products
    const filteredProducts = useMemo(() => {
        let filtered = allProducts

        if (selectedCategory !== 'all') {
            filtered = filtered.filter((p: any) => p.category === selectedCategory)
        }

        if (selectedMaterial !== 'all') {
            filtered = filtered.filter((p: any) => p.material === selectedMaterial)
        }

        filtered = filtered.filter(
            (p: any) => p.price >= priceRange[0] && p.price <= priceRange[1]
        )

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (p: any) =>
                    p.title.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.material?.toLowerCase().includes(q)
            )
        }

        switch (sortBy) {
            case 'price-low':
                filtered.sort((a: any, b: any) => a.price - b.price)
                break
            case 'price-high':
                filtered.sort((a: any, b: any) => b.price - a.price)
                break
            case 'name':
                filtered.sort((a: any, b: any) => a.title.localeCompare(b.title))
                break
            case 'newest':
            default:
                filtered.sort((a: any, b: any) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                break
        }

        return filtered
    }, [allProducts, selectedCategory, selectedMaterial, sortBy, priceRange, searchQuery])

    const clearFilters = () => {
        setSelectedCategory('all')
        setSelectedMaterial('all')
        setSortBy('newest')
        setPriceRange([0, 5000])
        setSearchQuery('')
    }

    const handleAddProduct = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const handleEditProduct = (productId: string) => {
        setEditingProduct(productId)
        setIsModalOpen(true)
    }

    const handleModalSuccess = () => {
        refetch()
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setEditingProduct(null)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id)
                alert('Product deleted successfully!')
                refetch()
            } catch (err) {
                alert('Error deleting product')
                console.error(err)
            }
        }
    }

    // Add these functions inside ProductContent
    const handleToggleActive = async (product: any) => {
        try {
            if (product.isActive) {
                // Deactivate
                if (!confirm('Are you sure you want to deactivate this product?')) return;
                await deactivateProduct(product._id); // soft delete
                alert('Product deactivated!');
            } else {
                // Reactivate
                await reactivateProduct(product._id);
                alert('Product reactivated!');
            }
            refetch();
        } catch (err) {
            alert('Error updating product status');
            console.error(err);
        }
    };

    if (isLoading) {
        return <div className="text-center py-16 text-zinc-500">Loading products...</div>
    }

    if (isError) {
        return <div className="text-center py-16 text-red-500">Error loading products.</div>
    }

    const activeFiltersCount = [
        selectedCategory !== 'all',
        selectedMaterial !== 'all',
        priceRange[1] !== 5000,
        searchQuery !== ''
    ].filter(Boolean).length

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${dmFont.className}`}>
                            Product Management
                        </h1>
                        <p className="text-gray-600">
                            Manage your product inventory and listings
                        </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md w-full">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search products by name, category, or material..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Filters & Actions */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name} ({cat.count})
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedMaterial}
                                    onChange={(e) => setSelectedMaterial(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {materials.map(mat => (
                                        <option key={mat.id} value={mat.id}>
                                            {mat.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>

                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear ({activeFiltersCount})
                                    </button>
                                )}

                                <Button
                                    onClick={handleAddProduct}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Product
                                </Button>
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-4">
                                <Label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                    Price Range:
                                </Label>
                                <div className="flex-1 max-w-md">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                                        <span>₹{priceRange[0]}</span>
                                        <span>₹{priceRange[1]}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="5000"
                                        step="100"
                                        value={priceRange[1]}
                                        onChange={(e) =>
                                            setPriceRange([priceRange[0], parseInt(e.target.value)])
                                        }
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="mb-4 text-sm text-gray-600">
                        Showing {filteredProducts.length} of {allProducts.length} products
                    </div>

                    {/* Products Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                                            Material
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            Stock
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg
                                                        className="w-12 h-12 text-gray-300 mb-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.5}
                                                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                                        />
                                                    </svg>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No products found
                                                    </h3>
                                                    <p className="text-gray-500 mb-4">
                                                        Try adjusting your filters or search terms
                                                    </p>
                                                    <Button onClick={clearFilters} size="sm">
                                                        Clear All Filters
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product: any) => (
                                            <tr key={product._id} className="hover:bg-gray-50 transition">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={product.image || product.images?.[0]?.url || 'https://via.placeholder.com/50'}
                                                            alt={product.title}
                                                            className="w-12 h-12 object-cover rounded-lg"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                {product.title}
                                                            </div>
                                                            {product.description && (
                                                                <div className="text-xs text-gray-500 mt-1 truncate hidden sm:block">
                                                                    {product.description}
                                                                </div>
                                                            )}
                                                            <div className="sm:hidden text-xs text-gray-500 mt-1">
                                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                                                    {product.category}
                                                                </span>
                                                                <span>₹{product.price?.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                                                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                                                        {product.material || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <div className="flex flex-col">
                                                        <span>₹{product.price?.toFixed(2)}</span>
                                                        {product.originalPrice && product.originalPrice > product.price && (
                                                            <span className="text-xs text-gray-500 line-through">
                                                                ₹{product.originalPrice?.toFixed(2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                                                    {product.stock || product.quantity || 'N/A'}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${product.isActive === false
                                                        ? 'bg-red-100 text-red-800'
                                                        : (product.stock > 0
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-yellow-100 text-yellow-800')
                                                        }`}>
                                                        {product.isActive === false
                                                            ? 'Inactive'
                                                            : (product.stock > 0 ? 'In Stock' : 'Out of Stock')
                                                        }
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(product)
                                                                setIsDetailModalOpen(true)
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditProduct(product._id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>

                                                        {/* Toggle Active / Inactive */}
                                                        <Switch
                                                            checked={product.isActive}
                                                            onChange={() => handleToggleActive(product)}
                                                            className={`${product.isActive ? 'bg-green-500' : 'bg-gray-300'
                                                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300`}
                                                        >
                                                            <span
                                                                className={`${product.isActive ? 'translate-x-6' : 'translate-x-1'
                                                                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300`}
                                                            />
                                                        </Switch>

                                                        {/* Permanent Delete */}
                                                        <button
                                                            onClick={() => handleDelete(product._id)}
                                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition"
                                                            title="Delete Permanently"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>

                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            <ProductModal
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                productId={editingProduct || undefined}
                isOpen={isModalOpen}
            />
            {/* Product Modal */}
            <ProductDetailsModal
                onClose={() => setIsDetailModalOpen(false)}
                product={selectedProduct}
                isOpen={isDetailModalOpen}
            />
        </>
    )
}