// lib/api/orders.ts
import { IOrder } from "@/types/order"
import api from "./index" // assuming same axios instance used for products

// ✅ Get all orders (admin)
export const getAllOrders = async (): Promise<IOrder[]> => {
    const res = await api.get("/orders")
    return res.data.orders || []
}

// // ✅ Get logged-in user orders
// export const getUserOrders = async (): Promise<IOrder[]> => {
//     const res = await api.get("/orders/user")
//     return res.data.data || []
// }

// ✅ Add manual order (admin)
export const addManualOrder = async (payload: {
    userId: string
    items: {
        product: string
        quantity: number
        finalPrice?: number
    }[]
    shippingAddress: {
        name: string
        phone: string
        address: string
        city: string
        state: string
        pincode: string
    }
    paymentMode: string
    totalAmount: number
}) => {
    const res = await api.post("/orders/manual", payload)
    return res.data.order
}

// ✅ Update order status
export const updateOrderStatus = async (orderId: string, status: string) => {
    const res = await api.patch(`/orders/${orderId}/status`, { status })
    return res.data.order
}
