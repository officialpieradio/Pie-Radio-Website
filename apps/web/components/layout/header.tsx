"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "Home", href: "/" },
    { name: "Schedule", href: "/schedule" },
    { name: "Presenters", href: "/presenters" },
    { name: "Events", href: "/events" },
    { name: "News", href: "/news" },
];

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <Link href="/" className="mr-6 flex items-center">
                        <Image
                            src="/assets/logo.png"
                            alt="Pie Radio"
                            width={500}
                            height={500}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80 text-foreground/60"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground">
                        <Search className="h-4 w-4" />
                        <span className="sr-only">Search</span>
                    </button>
                    <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground">
                        <User className="h-4 w-4" />
                        <span className="sr-only">Account</span>
                    </button>
                    <button className="md:hidden relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground">
                        <Menu className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
