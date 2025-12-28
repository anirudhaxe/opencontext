"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";

interface SidebarHeaderProps {
  onToggle: () => void;
  onNewChat: () => void;
  isMobile?: boolean;
}

export function SidebarHeader({
  onToggle,
  onNewChat,
  isMobile = false,
}: SidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-sidebar-border bg-linear-to-b from-sidebar to-sidebar/50 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 group">
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
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="p-1 brand-hover rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
            title="Collapse sidebar"
          >
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={2} />
              <line x1="9" y1="4" x2="9" y2="20" strokeWidth={2} />
            </svg>
          </Button>
        )}
      </div>

      <Button
        onClick={onNewChat}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm border border-border/50 rounded-lg brand-gradient text-primary-foreground hover:brand-gradient-dark transition-all duration-300 ease-in-out brand-shadow-sm hover:brand-shadow cursor-pointer"
        variant="default"
      >
        <Plus className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
        <span className="opacity-100 w-auto font-medium">New chat</span>
      </Button>
    </div>
  );
}
