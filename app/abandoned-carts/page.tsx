'use client'

import { useState } from 'react'
import {
    ShoppingCart,
    User,
    Calendar,
    Trash2,
    Package,
    Gift,
    Search,
    RefreshCw,
    AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAbandonedCarts, useClearAbandonedCart } from '@/hooks/useAbandonedCarts'
import { toast } from 'sonner'
import { imgUrl } from '@/lib/utils'
import DateFilter, { DateFilterState, isInDateRange } from '@/components/ui/DateFilter'

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

interface CartItem {
    _id: string
    itemType: 'product' | 'hamper'
    quantity: number
    product?: {
        _id: string
        title: string
        price: number
        images?: Array<{ url: string }>
    }
    hamper?: {
        _id: string
        title?: string
        pricing: { total: number }
        products: Array<{ snapshot: { title: string; price: number } }>
    }
}

interface AbandonedCart {
    _id: string
    user: {
        _id: string
        name?: string
        email?: string
        phone?: string
    }
    items: CartItem[]
    updatedAt: string
    createdAt: string
}

function cartValue(items: CartItem[]): number {
    return items.reduce((sum, item) => {
        if (item.itemType === 'product' && item.product) {
            return sum + item.product.price * item.quantity
        }
        if (item.itemType === 'hamper' && item.hamper) {
            return sum + item.hamper.pricing.total * item.quantity
        }
        return sum
    }, 0)
}

function AbandonedCartCard({
    cart,
    onClear,
    clearing,
}: {
    cart: AbandonedCart
    onClear: () => void
    clearing: boolean
}) {
    const value = cartValue(cart.items)
    const productCount = cart.items.filter(i => i.itemType === 'product').length
    const hamperCount = cart.items.filter(i => i.itemType === 'hamper').length

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 text-sm">
                            {cart.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {cart.user?.email || cart.user?.phone || 'No contact'}
                        </p>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold text-gray-800">₹{value.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 justify-end mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {fmtDate(cart.updatedAt)} {fmtTime(cart.updatedAt)}
                    </p>
                </div>
            </div>

            {/* Items */}
            <div className="px-5 py-3 space-y-3">
                {productCount > 0 && (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                            <Package className="h-3 w-3" /> Products ({productCount})
                        </p>
                        <div className="space-y-2">
                            {cart.items
                                .filter(i => i.itemType === 'product' && i.product)
                                .map(item => (
                                    <div key={item._id} className="flex items-center gap-2.5">
                                        {item.product!.images?.[0]?.url ? (
                                            <img
                                                src={imgUrl(item.product!.images[0].url)}
                                                alt={item.product!.title}
                                                className="w-9 h-9 rounded object-cover shrink-0 border border-gray-100"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                                <Package className="h-4 w-4 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-700 truncate font-medium">{item.product!.title}</p>
                                            <p className="text-[10px] text-gray-400">
                                                ×{item.quantity} · ₹{item.product!.price.toLocaleString('en-IN')} each
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700 shrink-0">
                                            ₹{(item.product!.price * item.quantity).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
                {hamperCount > 0 && (
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                            <Gift className="h-3 w-3" /> Hampers ({hamperCount})
                        </p>
                        <div className="space-y-2">
                            {cart.items
                                .filter(i => i.itemType === 'hamper' && i.hamper)
                                .map(item => (
                                    <div key={item._id} className="bg-amber-50 border border-amber-100 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-medium text-amber-800">
                                                {item.hamper!.title || 'Gift Hamper'}
                                            </span>
                                            <span className="text-xs font-bold text-amber-700">
                                                ₹{item.hamper!.pricing.total.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        {item.hamper!.products.length > 0 && (
                                            <p className="text-[10px] text-amber-600">
                                                {item.hamper!.products.map(p => p.snapshot.title).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} · Added {fmtDate(cart.createdAt)}
                </p>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onClear}
                    disabled={clearing}
                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 text-xs h-8"
                >
                    {clearing ? (
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                        <Trash2 className="h-3 w-3 mr-1" />
                    )}
                    Clear Cart
                </Button>
            </div>
        </div>
    )
}

export default function AbandonedCartsPage() {
    const { data, isLoading, refetch } = useAbandonedCarts()
    const clearMutation = useClearAbandonedCart()
    const [search, setSearch] = useState('')
    const [clearingId, setClearingId] = useState<string | null>(null)
    const [dateFilter, setDateFilter] = useState<DateFilterState>({ from: '', to: '', preset: '' })

    const carts: AbandonedCart[] = data?.carts || []

    const filtered = carts.filter(cart => {
        const q = search.toLowerCase()
        const matchesSearch = !q || (
            cart.user?.name?.toLowerCase().includes(q) ||
            cart.user?.email?.toLowerCase().includes(q) ||
            cart.user?.phone?.includes(q)
        )
        const matchesDate = isInDateRange(cart.updatedAt, dateFilter.from, dateFilter.to, dateFilter.preset)
        return matchesSearch && matchesDate
    })

    const totalValue = carts.reduce((sum, c) => sum + cartValue(c.items), 0)

    const handleClear = async (cartId: string) => {
        setClearingId(cartId)
        try {
            await clearMutation.mutateAsync(cartId)
            toast.success('Cart cleared')
        } catch {
            toast.error('Failed to clear cart')
        } finally {
            setClearingId(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Customers who added items but haven&apos;t checked out
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    className="gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Abandoned Carts</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{carts.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Potential Revenue</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                        ₹{totalValue.toLocaleString('en-IN')}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Avg. Cart Value</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                        ₹{carts.length ? Math.round(totalValue / carts.length).toLocaleString('en-IN') : 0}
                    </p>
                </div>
            </div>

            {/* Search + Date Filter */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-64"
                    />
                </div>
                <DateFilter value={dateFilter} onChange={setDateFilter} />
            </div>

            {/* Cart List */}
            {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <ShoppingCart className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">
                        {search ? 'No carts match your search' : 'No abandoned carts!'}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        {search ? 'Try a different search term.' : 'Everyone is checking out. Great work!'}
                    </p>
                </div>
            ) : (
                <>
                    <p className="text-xs text-gray-500">
                        Showing {filtered.length} of {carts.length} carts
                    </p>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filtered.map(cart => (
                            <AbandonedCartCard
                                key={cart._id}
                                cart={cart}
                                onClear={() => handleClear(cart._id)}
                                clearing={clearingId === cart._id}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
