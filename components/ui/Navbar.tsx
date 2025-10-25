// components/navbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, User, Heart, Star } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Logo from '@/public/logo_wo_bg.svg';
import ProfileButton from '../ProfileButton';
import { useCart } from '@/context/CartContext';
import CartSheet from '../cart/cartSheet';
import WishlistSheet from '../cart/wishlistSheet';

interface NavbarProps {
    className?: string;
    logoSrc?: string;
}

const Navbar = ({ className = '', logoSrc }: NavbarProps) => {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { setCartOpen, setWishlistOpen, cartItems, wishlistItems } = useCart();


    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY) {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.search-container')) {
                setSearchOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [lastScrollY]);

    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [searchOpen]);

    const menuItems = [
        {
            title: 'Collections',
            items: [
                {
                    title: 'Engagement Rings',
                    href: '/collections/engagement-rings',
                    description: 'Forever begins here with our stunning diamond rings',
                    featured: true,
                },
                {
                    title: 'Wedding Bands',
                    href: '/collections/wedding-bands',
                    description: 'Symbols of unity crafted with precision',
                    featured: true,
                },
                {
                    title: 'Necklaces',
                    href: '/collections/necklaces',
                    description: 'Elegant expressions for every occasion',
                },
                {
                    title: 'Earrings',
                    href: '/collections/earrings',
                    description: 'Timeless beauty that frames your face',
                },
                {
                    title: 'Bracelets',
                    href: '/collections/bracelets',
                    description: 'Exquisite wrist adornments',
                },
                {
                    title: 'Fine Watches',
                    href: '/collections/watches',
                    description: 'Where precision meets luxury',
                },
            ]
        },
        {
            title: 'Fine Jewelry',
            items: [
                {
                    title: 'Diamond Collection',
                    href: '/fine-jewelry/diamonds',
                    description: 'Brilliant cuts with exceptional clarity',
                    premium: true,
                },
                {
                    title: 'Precious Stones',
                    href: '/fine-jewelry/precious-stones',
                    description: "Nature's masterpieces in stunning settings",
                },
                {
                    title: 'Gold Collection',
                    href: '/fine-jewelry/gold',
                    description: '18K & 24K perfection in every piece',
                    premium: true,
                },
                {
                    title: 'Platinum Collection',
                    href: '/fine-jewelry/platinum',
                    description: 'Pure luxury metal for discerning taste',
                    premium: true,
                },
            ]
        }
    ];

    const navigationItems = [
        { name: 'Custom Design', href: '/custom-design' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    const popularSearches = [
        'Diamond Rings',
        'Gold Necklaces',
        'Pearl Earrings',
        'Engagement Rings',
        'Wedding Bands',
        'Luxury Watches'
    ];

    const ListItem = ({ className, title, children, href, featured, premium, ...props }: {
        className?: string;
        title: string;
        children: React.ReactNode;
        href: string;
        featured?: boolean;
        premium?: boolean;
    }) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <Link
                        href={href}
                        className={cn(
                            "block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/50",
                            className
                        )}
                        {...props}
                    >
                        {(featured || premium) && (
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-[10px] px-1.5 py-0.5 mb-1",
                                    featured && "bg-amber-100 text-amber-900",
                                    premium && "bg-purple-100 text-purple-900"
                                )}
                            >
                                {featured && <Star className="h-2 w-2 mr-1 inline" />}
                                {featured ? 'Popular' : 'Premium'}
                            </Badge>
                        )}
                        <div className="text-sm font-medium leading-none mb-1">
                            {title}
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                            {children}
                        </p>
                    </Link>
                </NavigationMenuLink>
            </li>
        );
    };

    const toggleSearch = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSearchOpen(!searchOpen);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            // Navigate to products page with search query
            const searchParams = new URLSearchParams();
            searchParams.set('search', searchQuery.trim());
            router.push(`/products?${searchParams.toString()}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const handlePopularSearch = (searchTerm: string) => {
        setSearchQuery(searchTerm);
        const searchParams = new URLSearchParams();
        searchParams.set('search', searchTerm);
        router.push(`/products?${searchParams.toString()}`);
        setSearchOpen(false);
    };

    return (
        <>
            <nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b transition-transform duration-300",
                    isVisible ? "translate-y-0" : "-translate-y-full",
                    className
                )}
            >

                {/* Promotional Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-accent text-primary-foreground text-center py-2 text-xs md:text-sm font-medium">
                    <div className="flex items-center justify-center gap-2 relative z-10">
                        <span className="relative font-semibold tracking-wide">
                            Free Shipping on Orders Over ₹500
                        </span>
                    </div>
                    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                </div>

                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    {/* Desktop Search Bar */}
                    <div className="hidden lg:block py-3">
                        <div className="max-w-xl mx-auto relative search-container">
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search diamonds, gold, watches..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearchKeyPress}
                                className="pr-10 pl-4 py-2 rounded-full text-sm"
                            />
                            <Button
                                onClick={handleSearchSubmit}
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <Image
                                src={Logo}
                                alt="The Born Jewels"
                                width={120}
                                className="w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-14 object-contain"
                                priority
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1">
                            <NavigationMenu>
                                <NavigationMenuList>
                                    {menuItems.map((section) => (
                                        <NavigationMenuItem key={section.title}>
                                            <NavigationMenuTrigger className="h-9 px-3 text-sm font-medium">
                                                {section.title}
                                            </NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <div className="w-[500px] p-4">
                                                    <h3 className="text-sm font-semibold mb-3">{section.title}</h3>
                                                    <ul className={cn("grid gap-2", section.title === 'Collections' ? 'md:grid-cols-2' : 'grid-cols-1')}>
                                                        {section.items.map((item) => (
                                                            <ListItem
                                                                key={item.title}
                                                                title={item.title}
                                                                href={item.href}
                                                                featured={'featured' in item ? item.featured : undefined}
                                                                premium={'premium' in item ? item.premium : undefined}
                                                            >
                                                                {item.description}
                                                            </ListItem>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </NavigationMenuContent>
                                        </NavigationMenuItem>
                                    ))}

                                    {navigationItems.map((item) => (
                                        <NavigationMenuItem key={item.name}>
                                            <Link href={item.href} className="inline-flex h-9 px-3 items-center text-sm font-medium hover:text-foreground/80">
                                                {item.name}
                                            </Link>
                                        </NavigationMenuItem>
                                    ))}
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center space-x-0.5 sm:space-x-1">
                            {/* Mobile Search */}
                            <Button variant="ghost" size="icon" onClick={toggleSearch} className="lg:hidden h-10 w-10">
                                <Search className="h-[18px] w-[18px]" />
                            </Button>

                            {/* Desktop Icons */}

                            <Button variant="ghost" size="icon" className="hidden lg:flex h-10 w-10 relative" onClick={() => setWishlistOpen(true)}>
                                <Heart className="h-5 w-5" />
                                {wishlistItems.length > 0}    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">{wishlistItems.length}</Badge>
                            </Button>

                            {/* Cart */}
                            <Button variant="ghost" size="icon" className="h-10 w-10 relative" onClick={() => setCartOpen(true)}>
                                <ShoppingBag className="h-[18px] w-[18px]" />
                                <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">{cartItems.length}</Badge>
                            </Button>

                            <ProfileButton />

                            {/* Mobile Menu */}
                            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10">
                                        <Menu className="h-[18px] w-[18px]" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto p-0">
                                    <div className="sticky top-0 bg-background border-b px-6 py-4 z-10">
                                        <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                                    </div>

                                    <div className="px-6 py-6 space-y-8">
                                        {/* Quick Actions */}
                                        <div className="flex items-center gap-3 pb-6 border-b">

                                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full relative" onClick={() => setWishlistOpen(true)}>
                                                <Heart className="h-5 w-5" />
                                                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">{wishlistItems.length}</Badge>
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full relative" onClick={() => setCartOpen(true)}>
                                                <ShoppingBag className="h-5 w-5" />
                                                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">{cartItems.length}</Badge>
                                            </Button>
                                            <Button variant="outline" size="icon" className="h-12 w-12 rounded-full">
                                                <ProfileButton />
                                            </Button>
                                        </div>

                                        {menuItems.map((section) => (
                                            <div key={section.title} className="space-y-3">
                                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{section.title}</h3>
                                                <div className="space-y-1">
                                                    {section.items.map((item) => (
                                                        <Link
                                                            key={item.title}
                                                            href={item.href}
                                                            className="block p-3 rounded-lg hover:bg-accent transition-colors"
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="font-medium text-sm">{item.title}</div>
                                                                {(('featured' in item && item.featured) || ('premium' in item && item.premium)) && (
                                                                    <Badge variant="secondary" className="text-[10px]">
                                                                        {'featured' in item && item.featured ? 'Popular' : 'Premium'}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        <Separator />

                                        <div className="space-y-1">
                                            {navigationItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="block p-3 rounded-lg hover:bg-accent font-medium text-sm transition-colors"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Overlay */}
                {searchOpen && (
                    <div className="lg:hidden fixed inset-0 bg-background z-50">
                        <div className="h-full flex flex-col">
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-4 border-b">
                                <h2 className="text-lg font-semibold">Search</h2>
                                <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)} className="h-10 w-10">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-4 py-6">
                                <div className="relative mb-8">
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search for jewelry..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleSearchKeyPress}
                                        className="pr-10 h-12 text-base"
                                    />
                                    <Button
                                        onClick={handleSearchSubmit}
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                                    >
                                        <Search className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Popular Searches</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {popularSearches.map((search) => (
                                            <button
                                                key={search}
                                                onClick={() => handlePopularSearch(search)}
                                                className="p-4 bg-accent rounded-lg hover:bg-accent/80 text-left text-sm font-medium transition-colors"
                                            >
                                                {search}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <CartSheet />
            <WishlistSheet />

            {/* Shimmer Animation */}
            <style jsx global>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%) skewX(-12deg);
                    }
                    100% {
                        transform: translateX(200%) skewX(-12deg);
                    }
                }

                .animate-shimmer {
                    animation: shimmer 3s ease-in-out infinite;
                }
            `}</style>
        </>
    );
};

export default Navbar;