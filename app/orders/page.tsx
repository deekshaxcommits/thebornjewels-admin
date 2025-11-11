'use client'

import { useEffect, useState } from "react"
import { Eye, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { downloadInvoice, downloadShippingLabel, getAllOrders, updateOrderStatus } from "@/lib/api/orders"
import { IOrder } from "@/types/order"
import { cn } from "@/lib/utils"
import OrderDetailsModal from "@/components/orders/OrderDetailsModel"
import { OrderModal } from "@/components/orders/order-modal"

export default function OrdersPage() {
    const [orders, setOrders] = useState<IOrder[]>([])
    const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [updateMessage, setUpdateMessage] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [trackingModal, setTrackingModal] = useState<{ id: string; visible: boolean }>({ id: "", visible: false })
    const [tracking, setTracking] = useState({ number: "", carrier: "", url: "", estimatedDelivery: "" })
    const [saving, setSaving] = useState(false)

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

    // 🔍 Filter by ID / name / email
    useEffect(() => {
        if (!searchQuery.trim()) return setFilteredOrders(orders)
        const q = searchQuery.toLowerCase()
        setFilteredOrders(
            orders.filter(order =>
                order._id.toLowerCase().includes(q) ||
                (order as any).user?.name?.toLowerCase().includes(q) ||
                (order as any).user?.email?.toLowerCase().includes(q)
            )
        )
    }, [searchQuery, orders])

    const handleStatusChange = async (id: string, status: string) => {
        if (status === "shipped") {
            setTrackingModal({ id, visible: true })
        } else {
            try {
                setUpdating(true)
                setUpdateMessage(`Updating order to "${status}"...`)
                await updateOrderStatus(id, status)
                await fetchOrders()
                setUpdateMessage("Order status updated successfully!")
                setTimeout(() => setUpdating(false), 1000)
            } catch (err) {
                console.error(err)
                setUpdateMessage("Something went wrong.")
                setTimeout(() => setUpdating(false), 1000)
            }
        }
    }

    const handleSaveTracking = async () => {
        if (!tracking.number || !tracking.carrier) {
            alert("Tracking number and carrier are required!")
            return
        }

        try {
            setSaving(true)
            setUpdateMessage("Saving shipping details...")
            await updateOrderStatus(trackingModal.id, "shipped", tracking)
            setTrackingModal({ id: "", visible: false })
            setTracking({ number: "", carrier: "", url: "", estimatedDelivery: "" })
            await fetchOrders()
            setUpdateMessage("Order marked as shipped!")
            setTimeout(() => setUpdating(false), 1000)
        } catch (err) {
            console.error("Error saving tracking:", err)
            setUpdateMessage("Something went wrong.")
        } finally {
            setSaving(false)
            setUpdating(true)
            setTimeout(() => setUpdating(false), 1500)
        }
    }

    const downloadBill = async (orderId: string, orderCode: string) => {
        try {
            console.log("downloading....");

            // this already gives you the blob
            const blob = await downloadInvoice(orderId);

            // create an object URL for the blob
            const url = URL.createObjectURL(blob);

            // make a hidden anchor tag to trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = `I${orderCode}.pdf`;
            document.body.appendChild(link);
            link.click();

            // cleanup
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading bill:", error);
        }
    };

    const downloadShippinglabel = async (orderId: string, orderCode: string) => {
        try {
            console.log("downloading....");

            // this already gives you the blob
            const blob = await downloadShippingLabel(orderId);

            // create an object URL for the blob
            const url = URL.createObjectURL(blob);

            // make a hidden anchor tag to trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = `S${orderCode}.pdf`;
            document.body.appendChild(link);
            link.click();

            // cleanup
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading bill:", error);
        }
    };

    return (
        <div className="p-6 space-y-6 relative">
            {/* 🔄 Global Overlay Loader for Fetch/Update */}
            {(loading || updating) && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm transition-all">
                    {loading ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                            <p className="text-sm text-gray-600">Fetching orders...</p>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2 animate-in fade-in duration-300" />
                            <p className="text-sm text-gray-600">{updateMessage || "Updating..."}</p>
                        </>
                    )}
                </div>
            )}

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
            {!loading && filteredOrders.length === 0 ? (
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
                                <tr key={order._id} className="hover:bg-gray-50 transition cursor-pointer">
                                    <td className="p-3 text-xs text-gray-600 font-mono">{order.orderCode}</td>
                                    <td className="p-3 font-medium text-gray-800">
                                        {(order as any).user?.name || "Guest"}
                                        <div className="text-xs text-gray-500">{(order as any).user?.email}</div>
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
                                                "border rounded px-2 py-1 text-xs font-medium capitalize cursor-pointer",
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
                                    <Button variant="outline" size="sm" className="ml-2" onClick={() => downloadBill(order._id, order.orderCode)}>
                                        Download Invoice
                                    </Button>
                                    <Button variant="outline" size="sm" className="ml-2" onClick={() => downloadShippinglabel(order._id, order.orderCode)}>
                                        Shipping
                                    </Button>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tracking Info Modal */}
            {trackingModal.visible && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
                        <button
                            onClick={() => setTrackingModal({ id: "", visible: false })}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Enter Shipping Details 🚚</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium text-gray-600">Tracking Number *</label>
                                <Input
                                    value={tracking.number}
                                    onChange={(e) => setTracking({ ...tracking, number: e.target.value })}
                                    placeholder="e.g. 7845129632"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Carrier *</label>
                                <Input
                                    value={tracking.carrier}
                                    onChange={(e) => setTracking({ ...tracking, carrier: e.target.value })}
                                    placeholder="e.g. Delhivery / BlueDart"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Tracking URL</label>
                                <Input
                                    value={tracking.url}
                                    onChange={(e) => setTracking({ ...tracking, url: e.target.value })}
                                    placeholder="https://tracking..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-600">Estimated Delivery (optional)</label>
                                <Input
                                    value={tracking.estimatedDelivery}
                                    onChange={(e) => setTracking({ ...tracking, estimatedDelivery: e.target.value })}
                                    placeholder="e.g. Nov 10 - Nov 12"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-5 gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setTrackingModal({ id: "", visible: false })}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={saving}
                                onClick={handleSaveTracking}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                {saving ? "Saving..." : "Save & Mark as Shipped"}
                            </Button>
                        </div>
                    </div>
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
