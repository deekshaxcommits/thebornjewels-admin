'use client'

import { useEffect, useState } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addManualOrder } from "@/lib/api/orders"
import { getAllUsers } from "@/lib/api/users"
import { getProducts } from "@/lib/api/products"
import { adminCreateHamper, getAllHampers } from "@/lib/api/hampers"
import { getAddons } from "@/lib/api/addons"

type ManualOrderItem = {
    itemType: "product" | "hamper"
    product?: string
    hamper?: string
    quantity: number
    unitPrice?: number
}

type HamperDraft = {
    title: string
    theme: string
    customMessage: string
    products: { product: string; quantity: number }[]
    addons: { addon: string; quantity: number; inputValue?: string }[]
}

interface OrderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function OrderModal({ isOpen, onClose, onSuccess }: OrderModalProps) {
    const [loading, setLoading] = useState(false)
    const [creatingHamper, setCreatingHamper] = useState(false)
    const [users, setUsers] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [hampers, setHampers] = useState<any[]>([])
    const [addons, setAddons] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState("")
    const [items, setItems] = useState<ManualOrderItem[]>([])
    const [hamperDraft, setHamperDraft] = useState<HamperDraft>({
        title: "",
        theme: "",
        customMessage: "",
        products: [{ product: "", quantity: 1 }],
        addons: [],
    })
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
            getAllHampers({ status: "active" }).then((data) => setHampers(data.hampers || [])).catch(console.error)
            getAddons().then((data) => setAddons(data.addons || data.data || [])).catch(console.error)
        }
    }, [isOpen])

    const addItem = (itemType: "product" | "hamper" = "product") => setItems([...items, { itemType, quantity: 1 }])
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index))
    const updateItem = <K extends keyof ManualOrderItem>(
        index: number,
        field: K,
        value: ManualOrderItem[K]
    ) => {
        setItems(prev => {
            const updated = [...prev];
            const next = { ...updated[index], [field]: value };
            if (field === "itemType") {
                delete next.product;
                delete next.hamper;
                delete next.unitPrice;
            }
            updated[index] = next;
            return updated;
        });
    };

    const addHamperProduct = () => {
        setHamperDraft(prev => ({
            ...prev,
            products: [...prev.products, { product: "", quantity: 1 }],
        }))
    }

    const updateHamperProduct = (index: number, field: "product" | "quantity", value: string | number) => {
        setHamperDraft(prev => {
            const products = [...prev.products]
            products[index] = { ...products[index], [field]: value }
            return { ...prev, products }
        })
    }

    const removeHamperProduct = (index: number) => {
        setHamperDraft(prev => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index),
        }))
    }

    const addHamperAddon = () => {
        setHamperDraft(prev => ({
            ...prev,
            addons: [...prev.addons, { addon: "", quantity: 1, inputValue: "" }],
        }))
    }

    const updateHamperAddon = (index: number, field: "addon" | "quantity" | "inputValue", value: string | number) => {
        setHamperDraft(prev => {
            const addons = [...prev.addons]
            addons[index] = { ...addons[index], [field]: value }
            return { ...prev, addons }
        })
    }

    const removeHamperAddon = (index: number) => {
        setHamperDraft(prev => ({
            ...prev,
            addons: prev.addons.filter((_, i) => i !== index),
        }))
    }

    const createHamperForOrder = async () => {
        if (!selectedUser) {
            alert("Select a user before creating a gift hamper")
            return
        }
        const validProducts = hamperDraft.products.filter(item => item.product)
        if (!validProducts.length) {
            alert("Add at least one product to the hamper")
            return
        }

        try {
            setCreatingHamper(true)
            const res = await adminCreateHamper({
                title: hamperDraft.title || "Manual Gift Hamper",
                theme: hamperDraft.theme,
                customMessage: hamperDraft.customMessage,
                products: validProducts,
                addons: hamperDraft.addons.filter(item => item.addon),
                status: "active",
                visibility: "private",
                createdBy: selectedUser,
            })
            const created = res.hamper
            setHampers(prev => [created, ...prev])
            setItems(prev => [
                ...prev,
                {
                    itemType: "hamper",
                    hamper: created._id,
                    quantity: 1,
                    unitPrice: created.pricing?.total || 0,
                },
            ])
            setHamperDraft({
                title: "",
                theme: "",
                customMessage: "",
                products: [{ product: "", quantity: 1 }],
                addons: [],
            })
            alert("Gift hamper created and added to this order")
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || "Error creating hamper")
        } finally {
            setCreatingHamper(false)
        }
    }

    useEffect(() => {
        // auto calculate total
        const total = items.reduce((acc, item) => {
            const source =
                item.itemType === "hamper"
                    ? hampers.find(h => h._id === item.hamper)
                    : products.find(p => p._id === item.product)
            const unitPrice = item.unitPrice ?? (item.itemType === "hamper" ? source?.pricing?.total : source?.price) ?? 0
            return acc + unitPrice * item.quantity
        }, 0)
        setTotalAmount(total)
    }, [items, products, hampers])

    const handleSubmit = async () => {
        const validItems = items.filter(item => item.itemType === "hamper" ? item.hamper : item.product)
        if (!selectedUser || validItems.length === 0) {
            alert("Please select user and add at least one product or hamper")
            return
        }

        try {
            setLoading(true)
            await addManualOrder({
                userId: selectedUser,
                items: validItems,
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
        setSelectedUser("")
        setHamperDraft({
            title: "",
            theme: "",
            customMessage: "",
            products: [{ product: "", quantity: 1 }],
            addons: [],
        })
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
                        <Label>Items</Label>
                        {items.map((item, i) => (
                            <div key={i} className="grid grid-cols-[120px_1fr_80px_92px] gap-2 items-center">
                                <select
                                    value={item.itemType}
                                    onChange={e => updateItem(i, "itemType", e.target.value as "product" | "hamper")}
                                    className="border rounded-lg px-3 py-2"
                                >
                                    <option value="product">Product</option>
                                    <option value="hamper">Hamper</option>
                                </select>
                                {item.itemType === "hamper" ? (
                                    <select
                                        value={item.hamper || ""}
                                        onChange={e => updateItem(i, "hamper", e.target.value)}
                                        className="flex-1 border rounded-lg px-3 py-2"
                                    >
                                        <option value="">Select Gift Hamper</option>
                                        {hampers.map(h => (
                                            <option key={h._id} value={h._id}>
                                                {h.title || "Gift Hamper"} - ₹{h.pricing?.total || 0}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        value={item.product || ""}
                                        onChange={e => updateItem(i, "product", e.target.value)}
                                        className="flex-1 border rounded-lg px-3 py-2"
                                    >
                                        <option value="">Select Product</option>
                                        {products.filter(p => p.type !== "combo").map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.title} - ₹{p.price}
                                            </option>
                                        ))}
                                    </select>
                                )}
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
                        <div className="flex gap-2">
                        <Button onClick={() => addItem("product")} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" /> Add Item
                        </Button>
                        <Button onClick={() => addItem("hamper")} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" /> Add Hamper
                        </Button>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                        <div>
                            <Label>Create Manual Gift Hamper</Label>
                            <p className="text-xs text-gray-500 mt-1">Create a private hamper and add it to this order in one step.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                placeholder="Hamper title"
                                value={hamperDraft.title}
                                onChange={e => setHamperDraft(prev => ({ ...prev, title: e.target.value }))}
                            />
                            <Input
                                placeholder="Theme"
                                value={hamperDraft.theme}
                                onChange={e => setHamperDraft(prev => ({ ...prev, theme: e.target.value }))}
                            />
                        </div>
                        <Input
                            placeholder="Custom message"
                            value={hamperDraft.customMessage}
                            onChange={e => setHamperDraft(prev => ({ ...prev, customMessage: e.target.value }))}
                        />

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Hamper Products</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addHamperProduct}>Add Product</Button>
                            </div>
                            {hamperDraft.products.map((item, index) => (
                                <div key={index} className="grid grid-cols-[1fr_80px_92px] gap-2">
                                    <select
                                        value={item.product}
                                        onChange={e => updateHamperProduct(index, "product", e.target.value)}
                                        className="border rounded-lg px-3 py-2"
                                    >
                                        <option value="">Select Product</option>
                                        {products.filter(p => p.type !== "combo").map(p => (
                                            <option key={p._id} value={p._id}>{p.title} - ₹{p.price}</option>
                                        ))}
                                    </select>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={e => updateHamperProduct(index, "quantity", Number(e.target.value))}
                                    />
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeHamperProduct(index)}>Remove</Button>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Hamper Add-ons</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addHamperAddon}>Add Add-on</Button>
                            </div>
                            {hamperDraft.addons.map((item, index) => (
                                <div key={index} className="grid grid-cols-[1fr_80px_1fr_92px] gap-2">
                                    <select
                                        value={item.addon}
                                        onChange={e => updateHamperAddon(index, "addon", e.target.value)}
                                        className="border rounded-lg px-3 py-2"
                                    >
                                        <option value="">Select Add-on</option>
                                        {addons.map(a => (
                                            <option key={a._id} value={a._id}>{a.title} - ₹{a.pricingType === "free" ? 0 : a.price}</option>
                                        ))}
                                    </select>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.quantity}
                                        onChange={e => updateHamperAddon(index, "quantity", Number(e.target.value))}
                                    />
                                    <Input
                                        placeholder="Message/input"
                                        value={item.inputValue || ""}
                                        onChange={e => updateHamperAddon(index, "inputValue", e.target.value)}
                                    />
                                    <Button type="button" variant="destructive" size="sm" onClick={() => removeHamperAddon(index)}>Remove</Button>
                                </div>
                            ))}
                        </div>

                        <Button type="button" onClick={createHamperForOrder} disabled={creatingHamper}>
                            {creatingHamper ? "Creating..." : "Create Hamper + Add To Order"}
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
