"use client";

import { useEffect, useState } from "react";
import { getOrders } from "@/lib/api/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { IOrder, IOrderItem } from "@/types/order";

const OrdersPage = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    useEffect(() => {
        async function fetchOrders() {
            try {
                const data = await getOrders();
                setOrders(data || []);
            } catch (err) {
                console.error("Error fetching orders:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const toggleOrder = (orderId: string) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 mt-42">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-700" />
                <p className="ml-2 text-zinc-500">Loading your orders...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center text-zinc-500 mt-42">
                <Image
                    src="/empty-orders.svg"
                    alt="No Orders"
                    width={150}
                    height={150}
                    className="mb-4 opacity-80"
                />
                <p>You haven't placed any orders yet.</p>
                <Button asChild className="mt-4">
                    <a href="/products">Shop Now</a>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 mt-42">
            <h1 className="text-2xl font-semibold text-zinc-900 mb-8">
                My Orders
            </h1>

            <div className="space-y-4">
                {orders.map((order) => {
                    const isExpanded = expandedOrders.has(order._id);

                    return (
                        <Card key={order._id} className="border border-zinc-200">
                            <CardHeader
                                className="cursor-pointer hover:bg-zinc-50 transition-colors"
                                onClick={() => toggleOrder(order._id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <CardTitle className="text-lg font-medium text-zinc-900">
                                                Order #{order._id.slice(-6).toUpperCase()}
                                            </CardTitle>
                                            <span
                                                className={`text-xs font-medium px-2.5 py-1 rounded-full ${order.status === "delivered"
                                                        ? "bg-green-100 text-green-700"
                                                        : order.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-zinc-100 text-zinc-700"
                                                    }`}
                                            >
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-zinc-500">
                                            <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                            <span>•</span>
                                            <p>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                                            <span>•</span>
                                            <p className="font-semibold text-zinc-900">₹{order.totalAmount}</p>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-zinc-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-zinc-400" />
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="space-y-4 pt-0">
                                    <div className="border-t border-zinc-200 pt-4 space-y-4">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.product._id}
                                                className="flex items-center justify-between"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-zinc-100">
                                                        <Image
                                                            src={
                                                                item.product.image ||
                                                                "https://via.placeholder.com/150"
                                                            }
                                                            alt={item.product.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-zinc-900">
                                                            {item.product.title}
                                                        </p>
                                                        <p className="text-xs text-zinc-500">
                                                            Qty: {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-sm font-semibold text-zinc-800">
                                                    ₹{item.product.price * item.quantity}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end border-t border-zinc-200 pt-4">
                                        <p className="text-base font-semibold text-zinc-900">
                                            Total: ₹{order.totalAmount}
                                        </p>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default OrdersPage;