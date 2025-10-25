'use client';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CartSheet = () => {
    const {
        cartOpen,
        setCartOpen,
        cartItems,
        removeFromCart,
        // updateQuantity,
        // getCartTotal
    } = useCart();

    const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
    const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const router = useRouter();


    const handleQuantityChange = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) {
            handleRemove(id);
            return;
        }

        setLoadingItems(prev => new Set(prev).add(id));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));

        // updateQuantity(id, newQuantity);
        setLoadingItems(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const handleRemove = async (id: string) => {
        setRemovingItems(prev => new Set(prev).add(id));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 400));

        removeFromCart(id);
        setRemovingItems(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        // Simulate checkout process
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCartOpen(false)
        router.push("/checkout")
        setIsCheckingOut(false);
        // Navigate to checkout or show success
    };

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col ">
                <SheetHeader className="flex-shrink-0 pb-4">
                    <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            <span>Shopping Cart</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                            </span>
                        </div>

                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-2 -mx-6 px-6 ">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12 ">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                Add items to get started
                            </p>
                            <Button
                                onClick={() => setCartOpen(false)}
                                className="min-w-[200px]"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3 px-4">
                            {cartItems.map((item) => {
                                const isRemoving = removingItems.has(item.product._id);
                                const isLoading = loadingItems.has(item.product._id);

                                return (
                                    <div
                                        key={item._id}
                                        className={`
                                            relative flex items-start gap-3 p-3 rounded-lg border bg-card
                                            transition-all duration-300 ease-in-out
                                            ${isRemoving ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100'}
                                            hover:shadow-md
                                        `}
                                    >
                                        {isLoading && (
                                            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            </div>
                                        )}

                                        <div className="flex-shrink-0 relative group">
                                            <Image
                                                src="https://i.pinimg.com/1200x/a6/84/f7/a684f7b71caea15faf484a8e0491617d.jpg"
                                                alt={item.product.title}
                                                width={80}
                                                height={80}
                                                className="rounded-md object-cover aspect-square transition-transform group-hover:scale-105"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm line-clamp-2 mb-1">
                                                {item.product.title}
                                            </p>
                                            <p className="text-lg font-semibold text-primary mb-3">
                                                ₹{item.product.price}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-background transition-colors"
                                                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                        disabled={isLoading}
                                                    >
                                                        {item.quantity === 1 ? (
                                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                        ) : (
                                                            <Minus className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                    <span className="text-sm font-medium w-8 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 hover:bg-background transition-colors"
                                                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                        disabled={isLoading}
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                <p className="font-semibold text-base">
                                                    ₹{(item.product.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(item.product._id)}
                                            className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                            disabled={isRemoving}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="flex-shrink-0 border-t pt-4 space-y-3 animate-in slide-in-from-bottom-4 pb-6 px-4">
                        <div className="space-y-2 px-1">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="h-px bg-border my-2" />
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total</span>
                                <span className="text-primary">₹{cartTotal}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 text-base font-semibold relative overflow-hidden group"
                            size="lg"
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                        >
                            {isCheckingOut ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10">Proceed to Checkout</span>
                                    <div className="absolute inset-0 bg-primary-foreground/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full transition-colors hover:bg-muted"
                            onClick={() => setCartOpen(false)}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartSheet;