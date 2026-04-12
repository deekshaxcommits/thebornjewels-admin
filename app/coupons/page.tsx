"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    getAllCoupons,
    deleteCoupon,
    toggleCouponActive,
    getCouponById,
    updateCoupon,
    createCoupon
} from "@/lib/api/coupon";
import CouponModal from "@/components/coupons/coupon-modal";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [filteredCoupons, setFilteredCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch all coupons
    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const data = (await getAllCoupons()) || []; // <-- safe fallback
            setCoupons(data);
            setFilteredCoupons(data);
        } catch (err) {
            console.error("Failed to fetch coupons:", err);
            setCoupons([]);
            setFilteredCoupons([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // Search filter
    useEffect(() => {
        if (!searchQuery.trim()) return setFilteredCoupons(coupons);
        const q = searchQuery.toLowerCase();

        setFilteredCoupons(
            coupons.filter(c =>
                c.code?.toLowerCase().includes(q) ||
                c.discountType?.toLowerCase().includes(q)
            )
        );
    }, [searchQuery, coupons]);

    // Delete Coupon
    const handleDelete = async (id: string) => {
        try {
            setUpdating(true);
            setUpdateMessage("Deleting coupon...");

            await deleteCoupon(id);
            await fetchCoupons();

            setUpdateMessage("Coupon deleted");
            setTimeout(() => setUpdating(false), 1000);
        } catch (err) {
            console.error(err);
            setUpdateMessage("Error deleting coupon");
            setTimeout(() => setUpdating(false), 1200);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            setUpdating(true);
            setUpdateMessage("Updating coupon status...");

            await toggleCouponActive(id);
            await fetchCoupons();

            setUpdateMessage("Status updated");
            setTimeout(() => setUpdating(false), 900);
        } catch (err) {
            console.error(err);
            setUpdateMessage("Failed to update");
            setTimeout(() => setUpdating(false), 1200);
        }
    };
    const [editData, setEditData] = useState(null);

    const handleEdit = async (id: string) => {
        try {
            const coupon = await getCouponById(id);
            setEditData(coupon);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Failed to load coupon:", err);
        }
    };


    return (
        <div className="p-6 space-y-6 relative">

            {/* Global overlay loader */}
            {(loading || updating) && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
                    {loading ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
                            <p className="text-sm text-gray-600">Fetching coupons...</p>
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-8 h-8 text-green-600 mb-2" />
                            <p className="text-sm text-gray-600">{updateMessage}</p>
                        </>
                    )}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-800">
                    🎟️ Coupons Management
                </h1>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Input
                        placeholder="Search coupons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64"
                    />

                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Coupon
                    </Button>
                </div>
            </div>

            {/* No Coupons Case */}
            {!loading && coupons.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No coupons found 😭
                    <br />
                    <span className="text-sm">Click “Add Coupon” to create your first one!</span>
                </div>
            )}

            {/* No search results */}
            {!loading && coupons.length > 0 && filteredCoupons.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No coupons match your search.
                </div>
            )}

            {/* Table */}
            {!loading && filteredCoupons.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-gray-600 uppercase text-xs font-semibold tracking-wide">
                                <th className="p-3">Code</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Value</th>
                                <th className="p-3">Min Order</th>
                                <th className="p-3">Expires</th>
                                <th className="p-3">Used</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredCoupons.map(c => (
                                <tr key={c._id} className="hover:bg-gray-50 transition">
                                    <td className="p-3 font-semibold">{c.code}</td>
                                    <td className="p-3 capitalize">{c.discountType}</td>
                                    <td className="p-3">
                                        {c.discountType === "percentage"
                                            ? `${c.discountValue}%`
                                            : `₹${c.discountValue}`}
                                    </td>
                                    <td className="p-3">
                                        {c.minOrderValue ? `₹${c.minOrderValue}` : "--"}
                                    </td>
                                    <td className="p-3">
                                        {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                                    </td>
                                    <td className="p-3">
                                        {c.usedCount}/{c.usageLimit ?? "∞"}
                                    </td>

                                    <td className="p-3 text-center flex items-center justify-center gap-2">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={c.active}
                                                onCheckedChange={() => handleToggle(c._id)}
                                            />
                                        </div>


                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEdit(c._id)}
                                        >
                                            Edit
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(c._id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </Button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Coupon Modal */}
            <CouponModal
                isOpen={isModalOpen}
                editData={editData}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditData(null);
                }}
                onSuccess={fetchCoupons}
            />

        </div>
    );
}
