/**
 * Navbar Component
 *
 * Fixed navigation bar with logo and authentication buttons.
 * Stays at top of viewport with glassmorphism effect.
 *
 * Features:
 * - Fixed positioning with backdrop blur
 * - Logo with hover effects
 * - Responsive spacing for mobile/desktop
 * - Shimmer animation on CTA button
 *
 * @returns Navigation bar component
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  return (
    <nav className="pt-5 fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Logo section with hover glow effect */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex-shrink-0">
            <Image
              src="/logo.png"
              alt="OpenContext Logo"
              width={32}
              height={32}
              className="transition-transform group-hover:scale-110"
            />
            {/* Glow effect on hover */}
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-semibold text-lg tracking-tight">
            OpenContext
          </span>
        </Link>

        {/* Auth buttons section */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1 cursor-pointer"
            onClick={() => router.push("/sign-in")}
          >
            Sign In
          </div>
          <Button
            asChild
            size="sm"
            className="relative overflow-hidden group brand-shadow-sm text-xs sm:text-sm cursor-pointer"
            onClick={() => router.push("/sign-up")}
          >
            <div>
              <span className="relative z-10">Get Started</span>
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </div>
          </Button>
        </div>
      </div>
    </nav>
  );
}
