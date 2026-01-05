"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, User, Moon, Sun, Settings, LogOut, Key } from "lucide-react";
import { useSession, signOut } from "@/lib/auth/auth-client";
import { ApiKeysModal } from "./ApiKeysModal";

interface UserMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export function UserMenu({
  isOpen,
  onToggle,
  isDarkMode,
  onThemeToggle,
}: UserMenuProps) {
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: session, isPending } = useSession();
  const [isApiKeysModalOpen, setIsApiKeysModalOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div
      className="p-3 border-t border-sidebar-border bg-linear-to-t from-sidebar to-sidebar/50 transition-all duration-300 ease-in-out"
      ref={userMenuRef}
    >
      <Button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-2 brand-hover rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
        variant="ghost"
        title="User menu"
      >
        <Avatar className="w-8 h-8 transition-transform duration-200 hover:scale-105 ring-2 ring-primary/20">
          <AvatarFallback className="brand-gradient text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-left transition-all duration-300 ease-in-out opacity-100 w-auto">
          {isPending ? (
            <>
              <div className="animate-pulse bg-muted rounded h-4 w-16 mb-1"></div>
              <div className="animate-pulse bg-muted rounded h-3 w-24"></div>
            </>
          ) : (
            <>
              <div className="text-sm font-medium text-foreground">
                {session?.user?.name || ""}
              </div>
              <div className="text-xs text-muted-foreground">
                {session?.user?.email || ""}
              </div>
            </>
          )}
        </div>
        <ChevronRight
          className={`h-4 text-primary transition-all duration-300 opacity-100 w-auto ${isOpen ? "rotate-90" : ""}`}
        />
      </Button>

      {isOpen && (
        <Card className="mt-2 bg-card border border-border rounded-lg brand-shadow-lg overflow-hidden animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
          {/* <Button */}
          {/*   onClick={() => { */}
          {/*     onThemeToggle(); */}
          {/*     onToggle(); */}
          {/*   }} */}
          {/*   className="w-full flex items-center gap-3 px-3 py-2 text-sm brand-hover rounded transition-colors justify-start" */}
          {/*   variant="ghost" */}
          {/* > */}
          {/*   {isDarkMode ? ( */}
          {/*     <Sun className="w-4 h-4 text-primary" /> */}
          {/*   ) : ( */}
          {/*     <Moon className="w-4 h-4 text-primary" /> */}
          {/*   )} */}
          {/*   <span className="text-foreground"> */}
          {/*     {isDarkMode ? "Light mode" : "Dark mode"} */}
          {/*   </span> */}
          {/* </Button> */}
          {/* <Separator className="bg-border/50" /> */}
          {/* <Button */}
          {/*   onClick={() => { */}
          {/*     onToggle(); */}
          {/*     // Handle settings */}
          {/*   }} */}
          {/*   className="w-full flex items-center gap-3 px-3 py-2 text-sm brand-hover rounded transition-colors justify-start" */}
          {/*   variant="ghost" */}
          {/* > */}
          {/*   <Settings className="w-4 h-4 text-primary" /> */}
          {/*   <span className="text-foreground">Settings</span> */}
          {/* </Button> */}
          {/* <Separator className="bg-border/50" /> */}
          <Button
            onClick={() => {
              setIsApiKeysModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm brand-hover rounded transition-colors justify-start"
            variant="ghost"
          >
            <Key className="w-4 h-4 text-primary" />
            <span className="text-foreground">API Keys</span>
          </Button>
          <Separator className="bg-border/50" />
          <Button
            onClick={async () => {
              await signOut();
              onToggle();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm brand-hover rounded transition-colors text-destructive justify-start"
            variant="ghost"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </Button>
        </Card>
      )}

      <ApiKeysModal open={isApiKeysModalOpen} onOpenChange={setIsApiKeysModalOpen} />
    </div>
  );
}
