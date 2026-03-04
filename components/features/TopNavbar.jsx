"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Menu,
  Trophy,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/features/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import MobileSidebarContent from "@/components/features/MobileSidebarContent";
import { TOTAL_QUESTIONS } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/questions", label: "All Questions", icon: LayoutGrid },
  { href: "/flashcard", label: "Flashcards", icon: BookOpen },
];

function NavbarInner() {
  const pathname = usePathname();
  const { theme, toggle, mounted } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("react-prep-confidence");
      if (stored) {
        const conf = JSON.parse(stored);
        setMasteredCount(Object.values(conf).filter((v) => v === "mastered").length);
      }
    } catch { }
  }, [pathname]);

  const masteredPct = Math.round((masteredCount / TOTAL_QUESTIONS) * 100);

  return (
    <header className="shrink-0 sticky top-0 z-40 bg-card border-b border-border lg:rounded-l-full">
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--app-green)", color: "#000" }}
          >
            ⚛
          </div>
          <span className="font-semibold text-sm text-foreground hidden sm:block">
            React Prep
          </span>
        </Link>

        <Separator orientation="vertical" className="h-5 hidden md:block" />

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 rounded-full",
                  isActive
                    ? "bg-primary/80 shadow-md shadow-primary/40 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <Icon
                  size={15}
                // style={{ color: isActive ? "var(--app-green)" : "inherit" }}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Progress pill — desktop only */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy size={12} style={{ color: "#fbbf24" }} />
          <span>
            <span className="font-semibold text-foreground tabular-nums">{masteredPct}%</span>
            {" "}mastered
          </span>
          {/* mini progress bar */}
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${masteredPct}%`, background: "var(--app-green)" }}
            />
          </div>
        </div>

        {/* GitHub link — desktop */}
        <a
          href="https://github.com/Zer0-XD/frontend-prep-nextjs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubIcon size={18} />
        </a>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8 shrink-0"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {mounted && (theme === "dark" ? <Sun size={15} /> : <Moon size={15} />)}
        </Button>

        {/* Mobile hamburger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="p-0 w-64 border-r-0"
            style={{ background: "var(--sb-bg)" }}
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Suspense fallback={<div className="w-64 h-full" style={{ background: "var(--sb-bg)" }} />}>
              <MobileSidebarContent onClose={() => setSheetOpen(false)} />
            </Suspense>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export default function TopNavbar() {
  return (
    <Suspense fallback={<div className="h-14 shrink-0 bg-card border-b border-border" />}>
      <NavbarInner />
    </Suspense>
  );
}
