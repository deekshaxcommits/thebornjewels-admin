'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Loader2, Settings, Heart, ReceiptText } from 'lucide-react'; // 👈 added ReceiptText
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileButton = () => {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [loggingOut, setLoggingOut] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        // Use a more professional confirmation method
        const confirmed = window.confirm('Are you sure you want to log out?');
        if (!confirmed) return;

        setLoggingOut(true);
        try {
            // Simulate API call delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            logout();
            toast.success('Logged out successfully');
            router.push('/auth/login');
        } catch (err) {
            console.error('Logout error:', err);
            toast.error('Failed to log out. Please try again.');
        } finally {
            setLoggingOut(false);
            setMenuOpen(false);
        }
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setMenuOpen(false);
    };

    if (!user) {
        return (
            <Button
                onClick={() => router.push('/auth/login')}
                variant="ghost"
                className="rounded-full text-sm font-medium px-4 py-2 transition-all hover:bg-gray-50 border border-gray-200"
            >
                Login
            </Button>
        );
    }

    return (
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className=" h-10 w-10 sm:h-12 sm:w-12 relative sm:rounded-full"
                    aria-label="User profile menu"
                >
                    <User className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>

            <AnimatePresence>
                {menuOpen && (
                    <DropdownMenuContent
                        align="end"
                        className="w-64 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl rounded-xl p-2 mt-1"
                        sideOffset={8}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                            {/* User Info Section */}
                            <DropdownMenuLabel className="flex flex-col gap-1.5 p-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border">
                                        <User className="h-5 w-5 text-gray-700" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">
                                            {user?.name || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {user?.email || ''}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator className="my-1" />

                            {/* Navigation Items */}
                            <div className="space-y-0.5">
                                <div className="space-y-0.5">
                                    <DropdownMenuItem
                                        className="flex items-center gap-3 cursor-pointer p-3 text-sm hover:bg-gray-50 rounded-lg transition-all"
                                        onClick={() => handleNavigation('/profile')}
                                    >
                                        <User className="h-4 w-4 text-gray-600" />
                                        <span>My Profile</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        className="flex items-center gap-3 cursor-pointer p-3 text-sm hover:bg-gray-50 rounded-lg transition-all"
                                        onClick={() => handleNavigation('/wishlist')}
                                    >
                                        <Heart className="h-4 w-4 text-gray-600" />
                                        <span>Wishlist</span>
                                    </DropdownMenuItem>

                                    {/* 👇 New Orders Section */}
                                    <DropdownMenuItem
                                        className="flex items-center gap-3 cursor-pointer p-3 text-sm hover:bg-gray-50 rounded-lg transition-all"
                                        onClick={() => handleNavigation('/orders')}
                                    >
                                        <ReceiptText className="h-4 w-4 text-gray-600" />
                                        <span>Orders</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        className="flex items-center gap-3 cursor-pointer p-3 text-sm hover:bg-gray-50 rounded-lg transition-all"
                                        onClick={() => handleNavigation('/settings')}
                                    >
                                        <Settings className="h-4 w-4 text-gray-600" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                </div>

                            </div>

                            <DropdownMenuSeparator className="my-1" />

                            {/* Logout Button */}
                            <DropdownMenuItem
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex items-center gap-3 cursor-pointer p-3 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600 rounded-lg transition-all"
                            >
                                {loggingOut ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Logging out...</span>
                                    </>
                                ) : (
                                    <>
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </>
                                )}
                            </DropdownMenuItem>
                        </motion.div>
                    </DropdownMenuContent>
                )}
            </AnimatePresence>
        </DropdownMenu>
    );
};

export default ProfileButton;