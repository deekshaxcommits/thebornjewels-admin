"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createCoupon, updateCoupon } from "@/lib/api/coupon";

export default function CouponModal({ isOpen, onClose, onSuccess, editData }: any) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        code: "",
        discountType: "percentage",
        discountValue: "",
        maxDiscount: "",
        minOrderValue: "",
        expiresAt: "",
        usageLimit: "",
        perUserLimit: "",
    });

    // Load form values when editing
    useEffect(() => {
        if (editData) {
            setForm({
                code: editData.code || "",
                discountType: editData.discountType || "percentage",
                discountValue: editData.discountValue?.toString() || "",
                maxDiscount: editData.maxDiscount?.toString() || "",
                minOrderValue: editData.minOrderValue?.toString() || "",
                expiresAt: editData.expiresAt?.split("T")[0] || "",
                usageLimit: editData.usageLimit?.toString() || "",
                perUserLimit: editData.perUserLimit?.toString() || ""
            });
        } else {
            setForm({
                code: "",
                discountType: "percentage",
                discountValue: "",
                maxDiscount: "",
                minOrderValue: "",
                expiresAt: "",
                usageLimit: "",
                perUserLimit: "",
            });
        }
    }, [editData]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                ...form,
                discountValue: Number(form.discountValue),
                maxDiscount: Number(form.maxDiscount),
                minOrderValue: Number(form.minOrderValue),
                usageLimit: Number(form.usageLimit),
                perUserLimit: Number(form.perUserLimit),
            };

            if (editData) {
                // UPDATE
                await updateCoupon(editData._id, payload);
            } else {
                // CREATE
                await createCoupon(payload);
            }

            onSuccess();
            onClose();
        } catch (error) {
            alert("Error saving coupon");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

            {/* Modal Box */}
            <div className="bg-white rounded-xl w-full max-w-3xl shadow-lg p-6 max-h-[90vh] overflow-y-auto">

                <h2 className="text-xl font-semibold mb-6">
                    {editData ? "Edit Coupon 🎟️" : "Create New Coupon 🎟️"}
                </h2>

                {/* TWO-COLUMN GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* LEFT */}
                    <div className="space-y-4">

                        {/* Code */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Coupon Code *</label>
                            <Input
                                placeholder="e.g. SAVE20"
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                            />
                        </div>

                        {/* Discount Type */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Discount Type *</label>
                            <select
                                value={form.discountType}
                                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                                className="border p-2 rounded w-full text-sm"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat (₹)</option>
                            </select>
                        </div>

                        {/* Discount Value */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Discount Value * ({form.discountType === "percentage" ? "%" : "₹"})
                            </label>
                            <Input
                                type="number"
                                placeholder={form.discountType === "percentage" ? "e.g. 10" : "e.g. 200"}
                                value={form.discountValue}
                                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                            />
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="space-y-4">

                        {/* Max Discount */}
                        {form.discountType === "percentage" && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Max Discount (₹)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={form.maxDiscount}
                                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Min Order Value */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Minimum Order Value (₹)</label>
                            <Input
                                type="number"
                                placeholder="e.g. 1000"
                                value={form.minOrderValue}
                                onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                            />
                        </div>

                        {/* Expiry */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Expiry Date *</label>
                            <Input
                                type="date"
                                value={form.expiresAt}
                                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                            />
                        </div>

                    </div>

                    {/* FULL WIDTH */}
                    <div className="space-y-4 md:col-span-2">

                        {/* Usage Limit */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Total Usage Limit</label>
                            <Input
                                type="number"
                                placeholder="e.g. 100"
                                value={form.usageLimit}
                                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                            />
                        </div>

                        {/* Per User Limit */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Per User Usage Limit</label>
                            <Input
                                type="number"
                                placeholder="e.g. 1"
                                value={form.perUserLimit}
                                onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })}
                            />
                        </div>

                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end mt-6 gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : editData ? "Update Coupon" : "Create Coupon"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
