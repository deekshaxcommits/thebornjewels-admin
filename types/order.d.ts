// types/order.d.ts

import { IProduct } from "./product";

export interface IOrderItem {
    product: IProduct;
    name: string;
    image: string;
    originalPrice: number;
    price: number;
    quantity: number;
    finalPrice: number;
    createdAt: string;
    updatedAt: string;
}

export interface IShippingAddress {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
}

export interface IPaymentInfo {
    provider: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: "pending" | "paid" | "failed";
}

export interface IOrder {
    _id: string;
    orderCode: string;
    user: string;
    items: IOrderItem[];
    shippingAddress: IShippingAddress;
    paymentInfo: IPaymentInfo;
    shippingFee: number;
    totalAmount: number;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    createdAt: string;
    updatedAt: string;
    __v?: number;
}
