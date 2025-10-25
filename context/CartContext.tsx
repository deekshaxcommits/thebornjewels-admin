"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { Product } from "@/types/product";
import {
    addToCart as apiAddToCart,
    getCart,
    removeFromCart as apiRemoveFromCart,
    increaseQuantity,
    decreaseQuantity,
} from "@/lib/api/cart";
import {
    addToWishlist as apiAddToWishlist,
    getWishlist,
    removeFromWishlist as apiRemoveFromWishlist,
} from "@/lib/api/wishlist";

interface CartItem extends Product {
    product: any;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    wishlistItems: Product[];
    addToCart: (product: Product) => Promise<void>;
    addToWishlist: (product: Product) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    removeFromWishlist: (id: string) => Promise<void>;
    increaseQty: (id: string) => Promise<void>;
    decreaseQty: (id: string) => Promise<void>;
    cartOpen: boolean;
    wishlistOpen: boolean;
    setCartOpen: (v: boolean) => void;
    setWishlistOpen: (v: boolean) => void;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Load from backend once on mount
    // useEffect(() => {
    //     const loadData = async () => {
    //         setLoading(true);
    //         try {
    //             const [cartRes, wishlistRes] = await Promise.all([
    //                 getCart(),
    //                 getWishlist(),
    //             ]);
    //             console.log(cartRes, wishlistRes)
    //             setCartItems(cartRes.cart.items || []);
    //             setWishlistItems(wishlistRes.products || []);
    //         } catch (err) {
    //             console.error("Failed to load cart/wishlist:", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     loadData();
    // }, []);

    // 🛒 Add to cart
    const addToCart = async (product: Product) => {
        setLoading(true);
        try {
            await apiAddToCart(product._id, 1);
            const updatedCart = await getCart();
            setCartItems(updatedCart.cart.items || []);
            setCartOpen(true);
        } catch (err) {
            console.error("Error adding to cart:", err);
        } finally {
            setLoading(false);
        }
    };


    // ❤️ Add to wishlist
    const addToWishlist = async (product: Product) => {
        setLoading(true);
        try {
            const newWishlist = await apiAddToWishlist(product._id);
            setWishlistItems(newWishlist.products);
            // setWishlistOpen(true);
        } catch (err) {
            console.error("Error adding to wishlist:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🗑 Remove from cart
    const removeFromCart = async (id: string) => {
        setLoading(true);
        try {
            const updated = await apiRemoveFromCart(id);
            setCartItems(updated.items);
        } catch (err) {
            console.error("Error removing from cart:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🗑 Remove from wishlist
    const removeFromWishlist = async (id: string) => {
        setLoading(true);
        try {
            const updated = await apiRemoveFromWishlist(id);
            setWishlistItems(updated.products);
        } catch (err) {
            console.error("Error removing from wishlist:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔼 Increase quantity
    const increaseQty = async (id: string) => {
        setLoading(true);
        try {
            const updated = await increaseQuantity(id);
            setCartItems(updated);
        } catch (err) {
            console.error("Error increasing quantity:", err);
        } finally {
            setLoading(false);
        }
    };

    // 🔽 Decrease quantity
    const decreaseQty = async (id: string) => {
        setLoading(true);
        try {
            const updated = await decreaseQuantity(id);
            setCartItems(updated);
        } catch (err) {
            console.error("Error decreasing quantity:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                wishlistItems,
                addToCart,
                addToWishlist,
                removeFromCart,
                removeFromWishlist,
                increaseQty,
                decreaseQty,
                cartOpen,
                wishlistOpen,
                setCartOpen,
                setWishlistOpen,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
