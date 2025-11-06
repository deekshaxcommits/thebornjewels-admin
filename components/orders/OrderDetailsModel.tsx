import { IOrder } from "@/types/order";

import React from 'react'

const OrderDetailsModel = ({ order, onClose }: { order: IOrder; onClose: () => void }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "bg-yellow-100 text-yellow-800"
            case "confirmed": return "bg-blue-100 text-blue-800"
            case "shipped": return "bg-indigo-100 text-indigo-800"
            case "delivered": return "bg-green-100 text-green-800"
            case "cancelled": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Details</h2>

                {/* 🧾 Order Info */}
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-medium text-gray-900">{order._id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Order Date</p>
                        <p className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-semibold text-green-700">₹{order.totalAmount}</p>
                    </div>
                </div>

                {/* 👤 Customer Info */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Info</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-1">
                        <p><span className="font-medium">Name:</span> {(order as any).user?.name || "N/A"}</p>
                        <p><span className="font-medium">Email:</span> {(order as any).user?.email || "N/A"}</p>
                        <p><span className="font-medium">Phone:</span> {(order as any).shippingAddress?.phone || "—"}</p>
                    </div>
                </div>

                {/* 📦 Shipping Address */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        {(order as any).shippingAddress ? (
                            <>
                                <p>{(order as any).shippingAddress.address}</p>
                                <p>{(order as any).shippingAddress.city}, {(order as any).shippingAddress.state}</p>
                                <p>{(order as any).shippingAddress.pincode}</p>
                                <p>{(order as any).shippingAddress.country}</p>
                            </>
                        ) : (
                            <p className="text-gray-500">No address provided</p>
                        )}
                    </div>
                </div>

                {/* 🛍️ Ordered Items */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Items</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {item.product?.title || "Product removed"}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Qty: {item.quantity} × ₹{item.product.price.toLocaleString("en-IN")}
                                    </p>
                                </div>
                                <p className="font-semibold text-gray-800">
                                    ₹{(item.quantity * item.product.price).toLocaleString("en-IN")}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailsModel