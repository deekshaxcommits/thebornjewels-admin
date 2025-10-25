"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

import { toast } from "sonner";
import { Loader2, Heart, CheckCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const [cartLoading, setCartLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const { addToCart, addToWishlist, removeFromWishlist, removeFromCart, wishlistItems, cartItems } = useCart();

    console.log(
        `🛒 Checking if ${product.title} is in cart:`,
        {
            productId: String(product._id),
            cartItemIds: cartItems.map(i => String(i.product._id)),
            isInCart: cartItems.some(i => String(i._id) === String(product._id)),
        }
    );


    // useMemo so comparisons are stable and cheap
    const isWishlisted = useMemo(
        () => wishlistItems.some((item) => String(item._id) === String(product._id)),
        [wishlistItems, product._id]
    );

    const isInCart = useMemo(
        () => cartItems.some((item) => String(item.product._id) === String(product._id)),
        [cartItems, product._id]
    );

    const cartItem = useMemo(
        () => cartItems.find((item) => String(item.product._id) === String(product._id)),
        [cartItems, product._id]
    );

    const imageSrc = product.images?.[0]?.url || "https://i.pinimg.com/1200x/a6/84/f7/a684f7b71caea15faf484a8e0491617d.jpg";

    // Helper to support both sync and async context functions
    const ensurePromise = <T,>(maybePromiseOrValue: Promise<T> | T) => Promise.resolve(maybePromiseOrValue);

    const handleAddToCart = async () => {
        try {
            setCartLoading(true);
            if (isInCart) {
                // remove
                await ensurePromise(removeFromCart(product._id));
                toast.success(`${product.title} removed from cart`);
            } else {
                // add
                await ensurePromise(addToCart(product));
                toast.success(`${product.title} added to cart`);
            }
        } catch (err) {
            console.error(err);
            toast.error(isInCart ? "Failed to remove from cart" : "Failed to add to cart");
        } finally {
            setCartLoading(false);
        }
    };

    const handleWishlistToggle = async () => {
        try {
            setWishlistLoading(true);
            if (isWishlisted) {
                await ensurePromise(removeFromWishlist(product._id));
                toast.success("Removed from wishlist");
            } else {
                await ensurePromise(addToWishlist(product));
                toast.success("Added to wishlist");
            }
        } catch (err) {
            console.error(err);
            toast.error(isWishlisted ? "Failed to remove from wishlist" : "Failed to add to wishlist");
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <div className="group relative flex flex-col bg-white rounded-xl border border-zinc-100 hover:border-zinc-200 transition-all duration-300 hover:shadow-lg p-3 lg:p-0 lg:bg-transparent lg:border-none lg:hover:border-none lg:hover:shadow-none h-[340px] sm:h-[360px] lg:h-auto">
            {/* Badges */}
            <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
                {product.isNewArrival && (
                    <span className="bg-white px-2 py-1 text-xs font-medium text-zinc-900 rounded-sm shadow-sm border border-zinc-100">
                        New
                    </span>
                )}
                {product.isBestSeller && (
                    <span className="bg-zinc-900 px-2 py-1 text-xs font-medium text-white rounded-sm shadow-sm">
                        Best Seller
                    </span>
                )}
                {isInCart && (
                    <span className="bg-green-500 px-2 py-1 text-xs font-medium text-white rounded-sm shadow-sm flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        In Cart
                    </span>
                )}
            </div>

            {/* Wishlist Button */}
            <Button
                variant="ghost"
                size="icon"
                aria-pressed={isWishlisted}
                aria-busy={wishlistLoading}
                className={`absolute right-3 top-3 z-10 h-7 w-7 lg:h-8 lg:w-8 rounded-full backdrop-blur-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 shadow-sm hover:shadow-md border ${isWishlisted
                    ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                    : "bg-white/90 border-zinc-100 text-zinc-800 hover:bg-white"
                    }`}
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
            >
                {wishlistLoading ? (
                    <Loader2 className="h-3 w-3 lg:h-4 lg:w-4 animate-spin" />
                ) : (
                    <Heart
                        className={`h-3 w-3 lg:h-4 lg:w-4 transition-all duration-200 ${isWishlisted
                            ? "fill-red-500 text-red-500 scale-110"
                            : "group-hover:fill-red-200 group-hover:text-red-400"
                            }`}
                    />
                )}
            </Button>

            {/* Product Image */}
            <Link href={`/products/${product._id}`}>
                <div className="relative overflow-hidden rounded-lg bg-zinc-50 aspect-[4/5] sm:aspect-square">
                    <Image
                        src={imageSrc}
                        alt={product.title}
                        fill
                        priority
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Cart Overlay Badge */}
                    {isInCart && (
                        <div className="absolute bottom-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Info */}
            <div className="flex flex-col flex-1 mt-3 lg:mt-4">
                <div className="space-y-1 flex-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
                        {product.category}
                    </p>

                    <Link href={`/products/${product._id}`}>
                        <h3 className="font-medium text-zinc-900 hover:text-zinc-700 transition-colors line-clamp-2 text-sm lg:text-base leading-tight">
                            {product.title}
                        </h3>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 text-sm lg:text-base">
                            ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.originalPrice && (
                            <span className="text-xs lg:text-sm text-zinc-500 line-through">
                                ₹{product.originalPrice.toLocaleString("en-IN")}
                            </span>
                        )}
                    </div>

                    {/* Show quantity if in cart */}
                    {isInCart && cartItem && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle className="h-3 w-3" />
                            <span>In cart ({cartItem.quantity})</span>
                        </div>
                    )}
                </div>

                {/* Add to Cart Button */}
                {/* Add to Cart Button (bulletproof disabled) */}
                <Button
                    className={`w-full h-8 lg:h-9 text-xs lg:text-sm opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 mt-2 ${isInCart
                        ? "bg-green-500 text-white cursor-not-allowed pointer-events-none opacity-80" // visually disabled + block pointer events
                        : "text-white"
                        }`}
                    onClick={!isInCart ? handleAddToCart : undefined} // no click handler if already in cart
                    disabled={cartLoading || isInCart} // native disabled prop
                    aria-disabled={cartLoading || isInCart}
                    aria-busy={cartLoading}
                >
                    {cartLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {isInCart ? "Removing..." : "Adding..."}
                        </>
                    ) : isInCart ? (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Added to Cart
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Quick Add
                        </>
                    )}
                </Button>

            </div>
        </div>
    );
}
