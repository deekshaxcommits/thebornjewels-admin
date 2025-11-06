// components/product-modal.tsx
'use client'

import { useState, useEffect } from "react"
import { X, Upload, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadTempFiles, createProduct, updateProduct, getProductByID } from "@/lib/api/products"

interface ProductModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    productId?: string
}

interface ProductFile {
    url: string
    key: string
    file?: File
    type: "image" | "video"
}

const materials = ["Gold", "Silver", "Platinum", "Rose Gold"]
const categories = ["Rings", "Necklaces", "Earrings", "Bracelets"]

export function ProductModal({ isOpen, onClose, onSuccess, productId }: ProductModalProps) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState(0)
    const [originalPrice, setOriginalPrice] = useState(0)
    const [category, setCategory] = useState(categories[0])
    const [material, setMaterial] = useState(materials[0])
    const [stock, setStock] = useState(0)
    const [isBestSeller, setIsBestSeller] = useState(false)
    const [isNewArrival, setIsNewArrival] = useState(false)
    const [meta, setMeta] = useState<{ occasion: string[]; style: string[] }>({ occasion: [], style: [] })
    const [files, setFiles] = useState<ProductFile[]>([])
    const [newOccasion, setNewOccasion] = useState("")
    const [newStyle, setNewStyle] = useState("")
    const [buyPrice, setBuyPrice] = useState(0)
    const [razorpayCutPercent, setRazorpayCutPercent] = useState(0)
    const [gstPercent, setGstPercent] = useState(3)
    const [deliveryFee, setDeliveryFee] = useState(0)
    const [totalCostBeforeMarkup, setTotalCostBeforeMarkup] = useState(0)
    const [calculatedSellingPrice, setCalculatedSellingPrice] = useState(0)

    // live calculations
    useEffect(() => {
        const razorpayCut = (razorpayCutPercent / 100) * buyPrice
        const gstCut = (gstPercent / 100) * buyPrice
        const total = buyPrice + razorpayCut + gstCut + deliveryFee
        setTotalCostBeforeMarkup(total)
        setCalculatedSellingPrice(Math.round(total * 2))
    }, [buyPrice, razorpayCutPercent, gstPercent, deliveryFee])


    useEffect(() => {
        if (productId && isOpen) {
            setLoading(true)
            getProductByID(productId)
                .then((data) => {
                    setTitle(data.title)
                    setDescription(data.description)
                    setPrice(data.price)
                    setOriginalPrice(data.originalPrice)
                    setCategory(data.category)
                    setMaterial(data.material)
                    setStock(data.stock)
                    setIsBestSeller(data.isBestSeller)
                    setIsNewArrival(data.isNewArrival)
                    setMeta(data.meta || { occasion: [], style: [] })
                    setBuyPrice(data.buyPrice || 0)
                    setRazorpayCutPercent(data.razorpayCutPercent || 0)
                    setGstPercent(data.gstPercent || 3)
                    setDeliveryFee(data.deliveryFee || 0)
                    setTotalCostBeforeMarkup(data.totalCostBeforeMarkup || 0)
                    setCalculatedSellingPrice(data.calculatedSellingPrice || 0)

                    setFiles(
                        data.images?.map((img: any) => ({
                            url: img.url,
                            key: img.key,
                            type: "image"
                        })) || []
                    )
                    // Optional: handle videos if backend supports it
                    if (data.videos) {
                        setFiles(prev => [
                            ...prev,
                            ...data.videos.map((vid: any) => ({
                                url: vid.url,
                                key: vid.key,
                                type: "video"
                            }))
                        ])
                    }
                })
                .catch(err => {
                    console.error(err)
                    alert("Failed to load product")
                })
                .finally(() => setLoading(false))
        } else if (!productId && isOpen) {
            resetForm()
        }
    }, [productId, isOpen])

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPrice(0)
        setOriginalPrice(0)
        setCategory(categories[0])
        setMaterial(materials[0])
        setStock(0)
        setIsBestSeller(false)
        setIsNewArrival(false)
        setMeta({ occasion: [], style: [] })
        setFiles([])
        setNewOccasion("")
        setNewStyle("")
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles: ProductFile[] = []
        const filesList = e.target.files
        if (!filesList) return

        setLoading(true)
        try {
            for (const file of Array.from(filesList)) {
                const dataArray = await uploadTempFiles(file)
                const type = file.type.startsWith("video") ? "video" : "image"
                for (const data of dataArray) {
                    uploadedFiles.push({
                        url: data.url,
                        key: data.key,
                        file,
                        type
                    })
                }
            }
            setFiles(prev => [...prev, ...uploadedFiles])
        } catch (err) {
            console.error(err)
            alert("Error uploading files")
        } finally {
            setLoading(false)
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const addOccasion = () => {
        if (newOccasion.trim() && !meta.occasion.includes(newOccasion.trim())) {
            setMeta(prev => ({
                ...prev,
                occasion: [...prev.occasion, newOccasion.trim()]
            }))
            setNewOccasion("")
        }
    }

    const removeOccasion = (index: number) => {
        setMeta(prev => ({
            ...prev,
            occasion: prev.occasion.filter((_, i) => i !== index)
        }))
    }

    const addStyle = () => {
        if (newStyle.trim() && !meta.style.includes(newStyle.trim())) {
            setMeta(prev => ({
                ...prev,
                style: [...prev.style, newStyle.trim()]
            }))
            setNewStyle("")
        }
    }

    const removeStyle = (index: number) => {
        setMeta(prev => ({
            ...prev,
            style: prev.style.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async () => {
        if (!title || !price || !category) {
            alert("Please fill all required fields")
            console.log("Validation failed", title, price, category)
            return
        }

        setLoading(true)
        const payload = {
            title,
            description,
            price,
            originalPrice,
            category,
            material,
            stock,
            isBestSeller,
            isNewArrival,
            meta,
            tempKeys: files.map(f => f.key),
            buyPrice,
            razorpayCutPercent,
            gstPercent,
            deliveryFee,
        }

        try {
            if (productId) {
                await updateProduct(productId, payload)
                alert("Product updated!")
            } else {
                await createProduct(payload)
                alert("Product created!")
            }
            onSuccess()
            handleClose()
        } catch (err) {
            console.error(err)
            alert("Error saving product")
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b shrink-0">
                    <h2 className="text-xl font-semibold">{productId ? "Edit Product" : "Add New Product"}</h2>
                    <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {loading && !productId ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            placeholder="Enter product title"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows={4}
                                            placeholder="Enter product description"
                                        />
                                    </div>


                                    {/* --- ADMIN PRICING SECTION --- */}
                                    <div className="mt-6 border-t pt-4">
                                        <h3 className="text-sm font-semibold text-zinc-800 mb-3">Pricing (Admin Only)</h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="buyPrice">Buy Price (₹)</Label>
                                                <Input
                                                    id="buyPrice"
                                                    type="text"
                                                    value={buyPrice}
                                                    onChange={(e) => setBuyPrice(Number(e.target.value))}
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="deliveryFee">Delivery Fee (₹)</Label>
                                                <Input
                                                    id="deliveryFee"
                                                    type="text"
                                                    value={deliveryFee}
                                                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="gstPercent">GST (%)</Label>
                                                <Input
                                                    id="gstPercent"
                                                    type="text"
                                                    value={gstPercent}
                                                    onChange={(e) => setGstPercent(Number(e.target.value))}
                                                    placeholder="3"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="razorpayCutPercent">Razorpay Cut (%)</Label>
                                                <Input
                                                    id="razorpayCutPercent"
                                                    type="text"
                                                    value={razorpayCutPercent}
                                                    onChange={(e) => setRazorpayCutPercent(Number(e.target.value))}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        {/* Auto Calculated Fields */}
                                        <div className="mt-6 border-t border-zinc-200 pt-4">
                                            <h4 className="text-sm font-semibold text-zinc-800 mb-3">Auto Calculated Summary</h4>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 rounded-xl shadow-inner">
                                                {/* Total Cost */}
                                                <div className="p-3 bg-white rounded-lg border border-zinc-200 shadow-sm">
                                                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                                                        Total Cost Before Markup
                                                    </p>
                                                    <p className="text-lg font-semibold text-zinc-800">
                                                        ₹{totalCostBeforeMarkup.toLocaleString("en-IN")}
                                                    </p>
                                                </div>

                                                {/* Calculated Selling Price */}
                                                <div className="p-3 bg-white rounded-lg border border-zinc-200 shadow-sm">
                                                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                                                        Suggested Selling Price
                                                    </p>
                                                    <p className="text-lg font-bold text-blue-700">
                                                        ₹{calculatedSellingPrice.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="mt-2 text-xs text-zinc-500">
                                                💡 These values are auto-calculated based on Buy Price, GST, Razorpay Cut, and Delivery Fee.
                                            </p>
                                        </div>

                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="price">Price On Website *</Label>
                                            <Input
                                                id="price"
                                                type="text"
                                                value={price}
                                                onChange={e => setPrice(Number(e.target.value))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="originalPrice">MRP *</Label>
                                            <Input
                                                id="originalPrice"
                                                type="text"
                                                value={originalPrice}
                                                onChange={e => setOriginalPrice(Number(e.target.value))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>



                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="category">Category *</Label>
                                            <select
                                                value={category}
                                                onChange={e => setCategory(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="material">Material *</Label>
                                            <select
                                                value={material}
                                                onChange={e => setMaterial(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {materials.map(mat => <option key={mat} value={mat}>{mat}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="stock">Stock</Label>
                                        <Input
                                            id="stock"
                                            type="number"
                                            value={stock}
                                            onChange={e => setStock(Number(e.target.value))}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <Label>Features</Label>
                                        <div className="flex flex-col gap-3 p-3 bg-gray-50 rounded-lg">
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isBestSeller}
                                                    onChange={e => setIsBestSeller(e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium">Best Seller</span>
                                            </label>
                                            <label className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isNewArrival}
                                                    onChange={e => setIsNewArrival(e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-medium">New Arrival</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Occasion Chips */}
                                    <div>
                                        <Label htmlFor="occasion">Occasion</Label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    id="occasion"
                                                    value={newOccasion}
                                                    onChange={e => setNewOccasion(e.target.value)}
                                                    placeholder="Add occasion (e.g., Wedding, Casual)"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addOccasion()
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addOccasion}
                                                    size="sm"
                                                    className="whitespace-nowrap"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {meta.occasion.map((occasion, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        <span>{occasion}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeOccasion(index)}
                                                            className="hover:text-blue-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Style Chips */}
                                    <div>
                                        <Label htmlFor="style">Style</Label>
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    id="style"
                                                    value={newStyle}
                                                    onChange={e => setNewStyle(e.target.value)}
                                                    placeholder="Add style (e.g., Elegant, Modern)"
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()
                                                            addStyle()
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={addStyle}
                                                    size="sm"
                                                    className="whitespace-nowrap"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {meta.style.map((style, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                                                    >
                                                        <span>{style}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeStyle(index)}
                                                            className="hover:text-purple-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Images / Videos</Label>
                                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:border-blue-500 transition-colors">
                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-sm text-gray-500">Click to upload images/videos</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,video/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>

                                        {files.length > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Uploaded Files ({files.length})
                                                    </span>
                                                    <button
                                                        onClick={() => setFiles([])}
                                                        className="text-xs text-red-600 hover:text-red-700"
                                                    >
                                                        Remove All
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                                                    {files.map((f, i) => (
                                                        <div key={i} className="relative group">
                                                            {f.type === "image" ? (
                                                                <img
                                                                    src={f.url || (f.file ? URL.createObjectURL(f.file) : '')}
                                                                    alt={`preview-${i}`}
                                                                    className="w-full h-20 object-cover rounded border"
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Image'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <video
                                                                    src={f.url || (f.file ? URL.createObjectURL(f.file) : '')}
                                                                    className="w-full h-20 object-cover rounded border"
                                                                    controls
                                                                />
                                                            )}
                                                            <button
                                                                onClick={() => removeFile(i)}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X size={10} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </div>
                        ) : productId ? (
                            "Update Product"
                        ) : (
                            "Create Product"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}