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
import { X, ShoppingCart, Heart, Loader2, Check } from 'lucide-react';

const WishlistSheet = () => {
    const {
        wishlistOpen,
        setWishlistOpen,
        wishlistItems,
        removeFromWishlist,
        addToCart
    } = useCart();

    const [addingItems, setAddingItems] = useState<Set<string>>(new Set());
    const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
    const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

    const handleAddToCart = async (item: any) => {
        setAddingItems(prev => new Set(prev).add(item._id));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        addToCart(item);
        setAddingItems(prev => {
            const next = new Set(prev);
            next.delete(item._id);
            return next;
        });

        // Show success state
        setAddedItems(prev => new Set(prev).add(item._id));
        setTimeout(() => {
            setAddedItems(prev => {
                const next = new Set(prev);
                next.delete(item._id);
                return next;
            });
        }, 2000);
    };

    const handleRemove = async (id: string) => {
        setRemovingItems(prev => new Set(prev).add(id));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 400));

        removeFromWishlist(id);
        setRemovingItems(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const handleMoveAllToCart = async () => {
        for (const item of wishlistItems) {
            await handleAddToCart(item);
        }
    };

    return (
        <Sheet open={wishlistOpen} onOpenChange={setWishlistOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader className="flex-shrink-0 pb-4">
                    <SheetTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Heart className="h-5 w-5 fill-current text-red-500" />
                            <span>My Wishlist</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                ({wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'})
                            </span>
                        </div>

                    </SheetTitle>
                </SheetHeader>

                {wishlistItems.length > 0 && (
                    <div className="flex-shrink-0 mb-3 px-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMoveAllToCart}
                            className="w-full hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Move All to Cart
                        </Button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto py-2 -mx-6 px-6">
                    {wishlistItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Heart className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                                Save items you love for later
                            </p>
                            <Button
                                onClick={() => setWishlistOpen(false)}
                                className="min-w-[200px]"
                            >
                                Start Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3  px-4">
                            {wishlistItems.map((item) => {
                                const isAdding = addingItems.has(item._id);
                                const isRemoving = removingItems.has(item._id);
                                const isAdded = addedItems.has(item._id);

                                return (
                                    <div
                                        key={item._id}
                                        className={`
                                            relative flex items-start gap-3 p-3 rounded-lg border bg-card
                                            transition-all duration-300 ease-in-out
                                            ${isRemoving ? 'opacity-0 scale-95 translate-x-4' : 'opacity-100 scale-100'}
                                            ${isAdded ? 'ring-2 ring-green-500' : ''}
                                            hover:shadow-md
                                        `}
                                    >
                                        {isAdded && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 animate-in zoom-in shadow-lg z-10">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}

                                        <div className="flex-shrink-0 relative group">
                                            <Image
                                                src="https://i.pinimg.com/1200x/a6/84/f7/a684f7b71caea15faf484a8e0491617d.jpg"
                                                alt={item.title}
                                                width={80}
                                                height={80}
                                                className="rounded-md object-cover aspect-square transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                                                <Heart className="h-6 w-6 text-white fill-current" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm line-clamp-2 mb-1 leading-tight">
                                                {item.title}
                                            </p>
                                            <p className="text-lg font-bold text-primary mb-3">
                                                ₹{item.price.toLocaleString()}
                                            </p>

                                            <Button
                                                size="sm"
                                                className={`
                                                    w-full h-9 text-xs font-semibold transition-all
                                                    ${isAdded ? 'bg-green-500 hover:bg-green-600' : ''}
                                                `}
                                                onClick={() => handleAddToCart(item)}
                                                disabled={isAdding || isAdded}
                                            >
                                                {isAdding ? (
                                                    <>
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                                        Adding...
                                                    </>
                                                ) : isAdded ? (
                                                    <>
                                                        <Check className="h-3.5 w-3.5 mr-1.5" />
                                                        Added to Cart
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(item._id)}
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

                {wishlistItems.length > 0 && (
                    <div className="flex-shrink-0 border-t pt-4 animate-in slide-in-from-bottom-4  px-4 pb-6">
                        <Button
                            variant="outline"
                            className="w-full transition-colors hover:bg-muted"
                            onClick={() => setWishlistOpen(false)}
                        >
                            Continue Shopping
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default WishlistSheet;