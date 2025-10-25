// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredUser, logoutUser } from "@/lib/api/auth";

type User = {
    _id: string;
    email: string;
    name?: string;
    isAdmin?: boolean;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    loginUser: (user: User, token: string) => void;
    logout: () => void;
    refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const stored = getStoredUser();
        if (stored) {
            setUser(stored);
        }
        setLoading(false);
    }, []);

    // Only redirect if trying to access protected routes without auth
    useEffect(() => {
        if (!loading) {
            const isProtectedRoute =
                pathname === '/' ||
                pathname?.startsWith('/products') ||
                pathname?.startsWith('/upload') ||
                pathname?.startsWith('/users') ||
                pathname?.startsWith('/settings');

            const isAuthRoute = pathname?.startsWith('/auth');

            if (isProtectedRoute && !user) {
                router.push('/auth/login');
            }

            if (isAuthRoute && user?.isAdmin) {
                router.push('/');
            }
        }
    }, [user, loading, pathname, router]);

    const loginUser = (user: User, token: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
    };

    const refreshUser = () => {
        const stored = getStoredUser();
        setUser(stored);
    };

    const logout = () => {
        logoutUser();
        setUser(null);
        router.push("/auth/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};