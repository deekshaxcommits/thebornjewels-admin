'use client'

import { useEffect, useState } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllOrders, updateOrderStatus } from "@/lib/api/orders"
import { IOrder } from "@/types/order"
import { cn } from "@/lib/utils"
import OrderDetailsModal from "@/components/orders/OrderDetailsModel"
import { OrderModal } from "@/components/orders/order-modal"

export default function OrdersPage() {
    const [orders, setOrders] = useState<IOrder[]>([])
    const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const data = await getAllOrders()
            setOrders(data)
            setFilteredOrders(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // 🔍 filter orders based on ID or user name/email
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredOrders(orders)
        } else {
            const q = searchQuery.toLowerCase()
            setFilteredOrders(
                orders.filter(order =>
                    order._id.toLowerCase().includes(q) ||
                    (order as any).user?.name?.toLowerCase().includes(q) ||
                    (order as any).user?.email?.toLowerCase().includes(q)
                )
            )
        }
    }, [searchQuery, orders])

    const handleStatusChange = async (id: string, status: string) => {
        await updateOrderStatus(id, status)
        fetchOrders()
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-800">📦 Orders Management</h1>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by Order ID or User..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    />
                    <Button onClick={() => setIsModalOpen(true)}>+ Add Order</Button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-10 text-gray-500 animate-pulse">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No matching orders found 😭</div>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-gray-600 uppercase text-xs font-semibold tracking-wide">
                                <th className="p-3">Order ID</th>
                                <th className="p-3">Customer</th>
                                <th className="p-3">Items</th>
                                <th className="p-3">Total</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Date</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(order => (
                                <tr
                                    key={order._id}
                                    className="hover:bg-gray-50 transition cursor-pointer"
                                >
                                    <td className="p-3 text-xs text-gray-600 font-mono">
                                        {order._id.slice(-8)} {/* short readable id */}
                                    </td>
                                    <td className="p-3 font-medium text-gray-800">
                                        {(order as any).user?.name || "Guest"}
                                        <div className="text-xs text-gray-500">
                                            {(order as any).user?.email}
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-700">
                                        {order.items.map((i, idx) => (
                                            <div key={idx} className="truncate">
                                                {i.product?.title || "Deleted Product"} × {i.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="p-3 font-semibold text-gray-900">
                                        ₹{order.totalAmount?.toLocaleString("en-IN")}
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={order.status}
                                            onChange={e => handleStatusChange(order._id, e.target.value)}
                                            className={cn(
                                                "border rounded px-2 py-1 text-xs font-medium capitalize",
                                                order.status === "pending" && "bg-yellow-100 text-yellow-800",
                                                order.status === "confirmed" && "bg-blue-100 text-blue-800",
                                                order.status === "shipped" && "bg-indigo-100 text-indigo-800",
                                                order.status === "delivered" && "bg-green-100 text-green-800",
                                                order.status === "cancelled" && "bg-red-100 text-red-800"
                                            )}
                                        >
                                            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-blue-600 hover:text-blue-800 transition"
                                        >
                                            <Eye className="w-4 h-4 inline mr-1" /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Details Modal */}
            {selectedOrder && (
                <OrderDetailsModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}

            {/* Add Order Modal */}
            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchOrders}
            />
        </div>
    )
}
