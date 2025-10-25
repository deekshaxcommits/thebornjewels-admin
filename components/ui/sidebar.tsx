"use client";


import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Logo from "../../public/logo.svg"
import Image from "next/image";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children }: { children: React.ReactNode }) => (
  <SidebarProvider>{children}</SidebarProvider>
);

export const SidebarBody = (props: React.ComponentProps<"div">) => (
  <>
    <DesktopSidebar {...props} />
    <MobileSidebar {...props} />
  </>
);

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border-r border-neutral-200 dark:border-neutral-800 z-40",
      className
    )}
    {...props}
  >
    {/* Header / Logo */}
    <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
      <Image
        src={Logo}
        alt="The Born Jewels Logo"
        className="h-12 w-12 object-contain"
      />
      <h1 className="text-lg font-semibold whitespace-nowrap">The Born Admin</h1>
    </div>


    {/* Sidebar Content */}
    <div className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-hidden">
      {children}
    </div>
  </div>
);

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <IconMenu2 size={24} className="text-neutral-800 dark:text-neutral-200" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={cn(
                "fixed top-0 left-0 h-full w-64 bg-neutral-100 dark:bg-neutral-900 z-50 flex flex-col shadow-xl",
                className
              )}
              {...(props as any)}
            >
              {/* Mobile Sidebar Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
                <Image
                  src={Logo}
                  alt="The Born Jewels Logo"
                  className="h-8 w-8 object-contain"
                />
                <h1 className="text-lg font-semibold">The Born Admin</h1>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <IconX size={20} className="text-neutral-800 dark:text-neutral-200" />
                </button>
              </div>

              {/* Mobile Sidebar Content */}
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto px-3 py-4">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

import Link from "next/link";

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { setMobileOpen } = useSidebar();

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors text-sm font-medium text-neutral-700 dark:text-neutral-200",
        className
      )}
      onClick={() => setMobileOpen(false)}
      {...props}
    >
      {link.icon}
      <span className="whitespace-nowrap">{link.label}</span>
    </Link>
  );
};

