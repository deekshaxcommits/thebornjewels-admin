'use client'

import { X, Calendar, Tag, Package, DollarSign, Hash, CheckCircle2, Clock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product } from "@/types/product"
import { useState } from "react"

interface ProductDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    product: Product | null | undefined
}

export function ProductDetailsModal({ isOpen, onClose, product }: ProductDetailsModalProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0)

    if (!isOpen || !product) return null

    const formatDate = (dateString?: string) => {
        if (!dateString) return "—"
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0

    // Combine all media sources (images/videos)
    const allMedia = product.images?.map(img => ({
        type: img.type || (img.url.endsWith(".mov") || img.url.endsWith(".mp4") ? "video" : "image"),
        url: img.url,
        key: img.key
    })) || []

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-50 to-yellow-50 p-6 border-b">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                                {product.isBestSeller && (
                                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Best Seller
                                    </span>
                                )}
                                {product.isNewArrival && (
                                    <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold">
                                        New Arrival
                                    </span>
                                )}
                                {product.isActive && (
                                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </span>
                                )}
                                {discount > 0 && (
                                    <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                                        {discount}% OFF
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 capitalize">{product.title || "Untitled Product"}</h2>
                            <p className="text-gray-600 mt-1">{product.description || "No description available"}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/80 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Media Gallery */}
                        <div className="space-y-4">
                            {allMedia.length > 0 && (
                                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg bg-gray-50">
                                    {allMedia[selectedImageIndex].type === 'video' ? (
                                        <video controls className="w-full h-full object-cover" key={allMedia[selectedImageIndex].url}>
                                            <source src={allMedia[selectedImageIndex].url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img src={allMedia[selectedImageIndex].url} alt={product.title} className="w-full h-full object-cover" />
                                    )}
                                </div>
                            )}

                            {allMedia.length > 1 && (
                                <div className="grid grid-cols-5 gap-2">
                                    {allMedia.map((media, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200 hover:border-amber-300'}`}
                                        >
                                            {media.type === 'video' ? (
                                                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                                    <span className="text-white text-xs">▶</span>
                                                </div>
                                            ) : (
                                                <img src={media.url} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            {/* Price Section */}
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-gray-900">₹{product.price ?? "—"}</span>
                                    {product.originalPrice && product.originalPrice > (product.price ?? 0) && (
                                        <>
                                            <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                                            <span className="px-2 py-1 bg-red-500 text-white rounded text-sm font-semibold">
                                                Save ₹{product.originalPrice - (product.price ?? 0)}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <DetailCard icon={<Tag className="w-4 h-4" />} label="Category" value={product.category ?? "—"} />
                                <DetailCard icon={<Sparkles className="w-4 h-4" />} label="Material" value={product.material ?? "—"} />
                                <DetailCard icon={<Package className="w-4 h-4" />} label="Stock" value={`${product.stock ?? 0} ${(product.stock ?? 0) === 1 ? 'unit' : 'units'}`} />
                                <DetailCard icon={<Hash className="w-4 h-4" />} label="SKU" value={product.sku ?? "—"} />
                            </div>
                            {/* 
                            Meta
                            {(product.meta?.occasion?.length || product.meta?.style?.length) > 0 && (
                                <div className="space-y-4">
                                    {product.meta?.occasion?.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Occasions</p>
                                            <div className="flex flex-wrap gap-2">
                                                {product.meta.occasion.map((o, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">{o}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {product.meta?.style?.length > 0 && (
                                        <div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2">Styles</p>
                                            <div className="flex flex-wrap gap-2">
                                                {product.meta.style.map((s, idx) => (
                                                    <span key={idx} className="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )} */}

                            {/* Timestamps */}
                            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span className="font-medium">Created:</span>
                                    <span>{formatDate(product.createdAt)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">Last Updated:</span>
                                    <span>{formatDate(product.updatedAt)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t p-6 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Product ID: {product._id ?? "—"}</p>
                    <Button onClick={onClose} className="bg-amber-500 hover:bg-amber-600 text-white px-8">Close</Button>
                </div>
            </div>
        </div>
    )
}

// Reusable detail card
const DetailCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">{icon}{label}</div>
        <p className="font-semibold text-gray-900">{value}</p>
    </div>
)
