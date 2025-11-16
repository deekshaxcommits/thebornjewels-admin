"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteReview, getProductByID } from "@/lib/api/products";
import { Product, ProductReview } from "@/types/product";

interface ReviewModalProps {
    productId: string;
    onClose: () => void;
}
export function ReviewModal({ productId, onClose }: ReviewModalProps) {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<ProductReview[]>([]);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data: Product = await getProductByID(productId);
            setReviews(data.reviews || []);
        } catch (err) {
            console.error(err);
            alert("Failed to load reviews");
        }
        setLoading(false);
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await deleteReview(productId, reviewId);
            setReviews(reviews.filter(r => r._id !== reviewId));
        } catch (err) {
            console.error(err);
            alert("Failed to delete review");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">Manage Reviews</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <p>Loading...</p>
                    ) : reviews.length === 0 ? (
                        <p className="text-gray-500">No reviews yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="p-4 border rounded-lg bg-gray-50">
                                    {/* User Info */}
                                    <div className="flex justify-between">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={review.user?.profile || "/default-user.png"}
                                                className="w-10 h-10 rounded-full border"
                                            />
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    {review.name || "Anonymous"}
                                                </p>

                                                {/* Rating */}
                                                <div className="flex text-yellow-500">
                                                    {Array.from({ length: review.rating }).map((_, i) => (
                                                        <span key={i}>★</span>
                                                    ))}
                                                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                                        <span className="text-gray-300" key={i}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(review._id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                                    )}

                                    {/* Images */}
                                    {review.images?.length && (
                                        <div className="flex gap-2 mt-2">
                                            {review.images.map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={img.url}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Date */}
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end">
                    <Button onClick={onClose} variant="outline">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
