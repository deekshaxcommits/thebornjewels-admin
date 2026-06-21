"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, Plus, Trash2, ExternalLink, Check, Search, X, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getAllOffers, createOffer, updateOffer, deleteOffer } from "@/lib/api/offers";
import { getProducts } from "@/lib/api/products";
import { API_BASE_URL } from "@/lib/api";

interface OfferProduct {
    _id: string;
    title: string;
    price: number;
    originalPrice?: number;
    images?: { url: string }[];
    category?: string;
    isActive?: boolean;
}

interface Offer {
    _id: string;
    slug: string;
    title: string;
    products: OfferProduct[];
    freeGiftName: string;
    freeGiftValue: number;
    isActive: boolean;
    updatedAt: string;
}

interface OfferEditorProps {
    offer: Partial<Offer> | null;
    allProducts: OfferProduct[];
    onSave: (data: any) => Promise<void>;
    onCancel: () => void;
    saving: boolean;
}

function OfferEditor({ offer, allProducts, onSave, onCancel, saving }: OfferEditorProps) {
    const [slug, setSlug] = useState(offer?.slug ?? "");
    const [title, setTitle] = useState(offer?.title ?? "");
    const [freeGiftName, setFreeGiftName] = useState(offer?.freeGiftName ?? "");
    const [freeGiftValue, setFreeGiftValue] = useState(String(offer?.freeGiftValue ?? 199));
    const [selectedIds, setSelectedIds] = useState<Set<string>>(
        new Set((offer?.products ?? []).map((p) => p._id))
    );
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (!search.trim()) return allProducts;
        const q = search.toLowerCase();
        return allProducts.filter(
            (p) => p.title.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
        );
    }, [allProducts, search]);

    const toggleProduct = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSave = () => {
        if (!slug.trim()) return toast.error("Slug is required (e.g. necklace-set)");
        if (!title.trim()) return toast.error("Title is required");
        if (selectedIds.size === 0) return toast.error("Select at least 1 product");
        onSave({
            slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
            title: title.trim(),
            products: Array.from(selectedIds),
            freeGiftName: freeGiftName.trim(),
            freeGiftValue: Number(freeGiftValue) || 0,
        });
    };

    return (
        <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-zinc-900">
                {offer?._id ? "Edit Offer" : "New Ad Offer"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Slug <span className="text-zinc-400 font-normal">(URL path, e.g. necklace-set)</span>
                    </label>
                    <Input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="necklace-set"
                        disabled={!!offer?._id}
                        className={offer?._id ? "opacity-60" : ""}
                    />
                    {offer?._id && (
                        <p className="text-[11px] text-zinc-400">Slug cannot be changed after creation</p>
                    )}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Offer Title
                    </label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Buy 2 Necklaces, Get Earrings Free"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Free Gift Name
                    </label>
                    <Input
                        value={freeGiftName}
                        onChange={(e) => setFreeGiftName(e.target.value)}
                        placeholder="Pearl Drop Earrings"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Free Gift Value (₹)
                    </label>
                    <Input
                        type="number"
                        value={freeGiftValue}
                        onChange={(e) => setFreeGiftValue(e.target.value)}
                        placeholder="199"
                        min={0}
                    />
                </div>
            </div>

            {/* Product picker */}
            <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Products in Offer{" "}
                        <span className="text-zinc-400 font-normal normal-case">
                            ({selectedIds.size} selected)
                        </span>
                    </label>
                    <div className="relative w-56">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products…"
                            className="pl-8 h-8 text-sm"
                        />
                    </div>
                </div>

                <div className="border border-zinc-100 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <p className="text-center text-zinc-400 py-8 text-sm">No products found</p>
                    ) : (
                        filtered.map((product) => {
                            const selected = selectedIds.has(product._id);
                            return (
                                <button
                                    key={product._id}
                                    onClick={() => toggleProduct(product._id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors ${selected ? "bg-amber-50" : ""}`}
                                >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${selected ? "bg-amber-500 border-amber-500" : "border-zinc-300"}`}>
                                        {selected && <Check className="h-3 w-3 text-white" />}
                                    </div>
                                    {product.images?.[0]?.url ? (
                                        <img
                                            src={`${API_BASE_URL}${product.images[0].url}`}
                                            alt={product.title}
                                            className="w-10 h-10 rounded-md object-cover flex-shrink-0 border border-zinc-100"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-md bg-zinc-100 flex-shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-800 truncate">{product.title}</p>
                                        <p className="text-xs text-zinc-400">
                                            ₹{product.price?.toLocaleString("en-IN")}
                                            {product.originalPrice ? (
                                                <span className="line-through ml-1.5 text-zinc-300">
                                                    ₹{product.originalPrice.toLocaleString("en-IN")}
                                                </span>
                                            ) : null}
                                            {product.category ? ` · ${product.category}` : ""}
                                        </p>
                                    </div>
                                    {!product.isActive && (
                                        <span className="text-[10px] bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full">Inactive</span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={onCancel} disabled={saving} className="flex-1 sm:flex-none">
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none bg-zinc-900 hover:bg-zinc-800">
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : "Save Offer"}
                </Button>
            </div>
        </div>
    );
}

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [allProducts, setAllProducts] = useState<OfferProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Offer> | null | "new">(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [offersData, productsData] = await Promise.all([
                getAllOffers(),
                getProducts(),
            ]);
            setOffers(offersData ?? []);
            setAllProducts(productsData ?? []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (data: any) => {
        setSaving(true);
        try {
            if (editing && typeof editing === "object" && "_id" in editing && editing._id) {
                await updateOffer(editing._id as string, data);
                toast.success("Offer updated");
            } else {
                await createOffer(data);
                toast.success("Offer created");
            }
            await fetchData();
            setEditing(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Failed to save offer");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this offer?")) return;
        setDeleting(id);
        try {
            await deleteOffer(id);
            await fetchData();
            toast.success("Offer deleted");
        } catch {
            toast.error("Failed to delete");
        } finally {
            setDeleting(null);
        }
    };

    const handleToggleActive = async (offer: Offer) => {
        try {
            await updateOffer(offer._id, { isActive: !offer.isActive });
            await fetchData();
            toast.success(`Offer ${offer.isActive ? "deactivated" : "activated"}`);
        } catch {
            toast.error("Failed to update");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 py-10 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-900">Ad Offers</h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Create and manage product sets for paid ad landing pages.
                        </p>
                    </div>
                    {!editing && (
                        <Button
                            onClick={() => setEditing("new")}
                            className="bg-zinc-900 hover:bg-zinc-800"
                        >
                            <Plus className="h-4 w-4 mr-2" /> New Offer
                        </Button>
                    )}
                </div>

                {/* Editor */}
                {editing && (
                    <OfferEditor
                        offer={editing === "new" ? null : editing}
                        allProducts={allProducts}
                        onSave={handleSave}
                        onCancel={() => setEditing(null)}
                        saving={saving}
                    />
                )}

                {/* Offer list */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                    </div>
                ) : offers.length === 0 && !editing ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-zinc-100">
                        <p className="text-zinc-400 mb-4">No offers yet</p>
                        <Button onClick={() => setEditing("new")} variant="outline">
                            <Plus className="h-4 w-4 mr-2" /> Create your first offer
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {offers.map((offer) => (
                            <div
                                key={offer._id}
                                className="bg-white rounded-xl border border-zinc-200 p-5 space-y-4"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h2 className="font-semibold text-zinc-900">{offer.title}</h2>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${offer.isActive ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                                                {offer.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <code className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                                                /offers/{offer.slug}
                                            </code>
                                            <a
                                                href={`/offers/${offer.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
                                            >
                                                <ExternalLink className="h-3 w-3" /> Preview page
                                            </a>
                                        </div>
                                        {offer.freeGiftName && (
                                            <p className="text-xs text-zinc-400 mt-1">
                                                Free gift: <span className="text-zinc-600">{offer.freeGiftName}</span> (worth ₹{offer.freeGiftValue})
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(offer)}
                                            className="text-zinc-400 hover:text-zinc-700 transition-colors p-1"
                                            title={offer.isActive ? "Deactivate" : "Activate"}
                                        >
                                            {offer.isActive ? (
                                                <ToggleRight className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <ToggleLeft className="h-5 w-5" />
                                            )}
                                        </button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditing(offer)}
                                            disabled={editing === offer}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleDelete(offer._id)}
                                            disabled={deleting === offer._id}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            {deleting === offer._id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Product chips */}
                                {offer.products.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {offer.products.map((p) => (
                                            <div
                                                key={p._id}
                                                className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-1.5"
                                            >
                                                {p.images?.[0]?.url && (
                                                    <img
                                                        src={`${API_BASE_URL}${p.images[0].url}`}
                                                        alt={p.title}
                                                        className="w-6 h-6 rounded object-cover"
                                                    />
                                                )}
                                                <span className="text-xs text-zinc-700 font-medium">{p.title}</span>
                                                <span className="text-xs text-zinc-400">₹{p.price?.toLocaleString("en-IN")}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
