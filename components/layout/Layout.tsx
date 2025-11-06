"use client";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import {
    IconLayoutDashboard,
    IconPackage,
    IconPlus,
    IconUsers,
    IconSettings,
    IconLogout,
    IconDiscountOff,
    IconDiscountCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { DockIcon, Package } from "lucide-react";
import { toast } from "sonner";
import router from "next/router";

type LayoutProps = {
    children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
    const { user, logout } = useAuth();

    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");
    const [loggingOut, setLoggingOut] = useState(false);

    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: <IconLayoutDashboard className="h-5 w-5" />,
        },
        {
            label: "Products",
            href: "/products",
            icon: <IconPackage className="h-5 w-5" />,
        },
        {
            label: "Orders",
            href: "/orders",
            icon: <IconDiscountCheck className="h-5 w-5" />,
        },
        {
            label: "Users",
            href: "/users",
            icon: <IconUsers className="h-5 w-5" />,
        },
        {
            label: "Settings",
            href: "/settings",
            icon: <IconSettings className="h-5 w-5" />,
        },
    ];

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
        }
    };

    return (
        <div className="flex bg-background text-primary min-h-screen overflow-hidden">
            {/* Sidebar (Fixed) */}

            {!isAuthPage && <Sidebar>
                <SidebarBody>
                    <div className="flex flex-col justify-between h-full">
                        <div className="space-y-3 mt-2">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (

                                    <SidebarLink
                                        key={link.href}
                                        link={link}
                                        className={cn(
                                            "rounded-md",
                                            isActive && "bg-neutral-300/40 dark:bg-neutral-700"
                                        )}
                                    />

                                );
                            })}
                        </div>

                        <div className="pb-4">
                            <div
                                onClick={handleLogout}
                                className="cursor-pointer hover:bg-red-100/80 dark:hover:bg-red-800/40 rounded-md"
                            >
                                <SidebarLink
                                    link={{
                                        label: "Logout",
                                        href: "#",
                                        icon: <IconLogout className="h-5 w-5 text-red-500" />,
                                    }}
                                />
                            </div>

                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>}


            {/* Scrollable Content Area */}
            <main className="flex-1 ml-0 md:ml-64 overflow-y-auto px-6 py-8">
                {children}
            </main>
        </div >
    );
}
