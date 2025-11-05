'use client'

import { useEffect, useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addManualOrder } from "@/lib/api/orders"
import { getAllUsers } from "@/lib/api/users"
import { getProducts } from "@/lib/api/products"

interface OrderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function OrderModal({ isOpen, onClose, onSuccess }: OrderModalProps) {
    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState("")
    const [items, setItems] = useState<{ product: string; quantity: number }[]>([])
    const [shipping, setShipping] = useState({
        name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    })
    const [paymentMode, setPaymentMode] = useState("cash")
    const [totalAmount, setTotalAmount] = useState<number>(0)

    useEffect(() => {
        if (isOpen) {
            getAllUsers().then(setUsers).catch(console.error)
            getProducts().then(setProducts).catch(console.error)
        }
    }, [isOpen])

    const addItem = () => setItems([...items, { product: "", quantity: 1 }])
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
    const updateItem = <K extends keyof (typeof items)[number]>(
        index: number,
        field: K,
        value: (typeof items)[number][K]
    ) => {
        setItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    useEffect(() => {
        // auto calculate total
        const total = items.reduce((acc, item) => {
            const product = products.find(p => p._id === item.product)
            return acc + (product?.price || 0) * item.quantity
        }, 0)
        setTotalAmount(total)
    }, [items, products])

    const handleSubmit = async () => {
        if (!selectedUser || items.length === 0) {
            alert("Please select user and add at least one product")
            return
        }

        try {
            setLoading(true)
            await addManualOrder({
                userId: selectedUser,
                items,
                shippingAddress: shipping,
                paymentMode,
                totalAmount,
            })
            alert("Order added successfully!")
            onSuccess()
            handleClose()
        } catch (err) {
            console.error(err)
            alert("Error adding order")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setItems([])
        setShipping({
            name: "", phone: "", address: "", city: "", state: "", pincode: ""
        })
        setPaymentMode("cash")
        setTotalAmount(0)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">Add Manual Order</h2>
                    <button onClick={handleClose}>
                        <X />
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    <div>
                        <Label>User</Label>
                        <select
                            value={selectedUser}
                            onChange={e => setSelectedUser(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="">Select User</option>
                            {users.map(u => (
                                <option key={u._id} value={u._id}>
                                    {u.name} ({u.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <Label>Products</Label>
                        {items.map((item, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <select
                                    value={item.product}
                                    onChange={e => updateItem(i, "product", e.target.value)}
                                    className="flex-1 border rounded-lg px-3 py-2"
                                >
                                    <option value="">Select Product</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.title} - ₹{p.price}
                                        </option>
                                    ))}
                                </select>
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => updateItem(i, "quantity", Number(e.target.value))}
                                    className="w-20"
                                    min={1}
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => removeItem(i)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addItem} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" /> Add Item
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(shipping).map(([key, val]) => (
                            <div key={key}>
                                <Label className="capitalize">{key}</Label>
                                <Input
                                    value={val}
                                    onChange={e => setShipping(prev => ({ ...prev, [key]: e.target.value }))}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <Label>Payment Mode</Label>
                        <select
                            value={paymentMode}
                            onChange={e => setPaymentMode(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2"
                        >
                            <option value="cash">Cash</option>
                            <option value="upi">UPI</option>
                        </select>
                    </div>

                    <div>
                        <Label>Total Amount</Label>
                        <Input
                            type="number"
                            value={totalAmount}
                            onChange={e => setTotalAmount(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="flex justify-end p-4 border-t gap-3">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving..." : "Add Order"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
