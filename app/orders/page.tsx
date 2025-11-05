'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { getAllOrders, updateOrderStatus } from "@/lib/api/orders"
import { IOrder } from "@/types/order"
import { OrderModal } from "@/components/orders/order-modal"

export default function OrdersPage() {
    const [orders, setOrders] = useState<IOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const data = await getAllOrders()
            setOrders(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleStatusChange = async (id: string, status: string) => {
        await updateOrderStatus(id, status)
        fetchOrders()
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Orders</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Add Order</Button>
            </div>

            {loading ? (
                <div>Loading orders...</div>
            ) : orders.length === 0 ? (
                <div>No orders found.</div>
            ) : (
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">User</th>
                                <th className="p-3 text-left">Items</th>
                                <th className="p-3 text-left">Total</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} className="border-t">
                                    <td className="p-3">{(order as any).user?.name || order.user}</td>
                                    <td className="p-3">
                                        {order.items.map(i => (
                                            <div key={i.product._id}>
                                                {i.product.title} × {i.quantity}
                                            </div>
                                        ))}
                                    </td>
                                    <td className="p-3 font-medium">₹{order.totalAmount}</td>
                                    <td className="p-3">
                                        <select
                                            value={order.status}
                                            onChange={e => handleStatusChange(order._id, e.target.value)}
                                            className="border rounded px-2 py-1"
                                        >
                                            {["pending", "confirmed", "shipped", "delivered", "cancelled"].map(st => (
                                                <option key={st} value={st}>{st}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 text-right text-blue-600 cursor-pointer">
                                        View
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchOrders}
            />
        </div>
    )
}
