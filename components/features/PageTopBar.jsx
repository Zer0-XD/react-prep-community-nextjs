"use client";

import { useState, useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sun,
  Moon,
  GithubIcon,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useTheme } from "@/components/features/ThemeProvider";
import MobileSidebarContent from "@/components/features/MobileSidebarContent";
import { TOTAL_QUESTIONS } from "@/lib/constants";

function TopBarInner({ title, description, rightSlot }) {
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
    <header className="shrink-0 sticky top-0 z-30 bg-card border-b border-border">
      <div className="flex items-center h-14 px-4 gap-3">
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

        {/* Page title area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
            {description && (
              <>
                <span className="text-border hidden sm:block">·</span>
                <span className="text-xs text-muted-foreground truncate hidden sm:block">{description}</span>
              </>
            )}
          </div>
        </div>

        {/* Right slot — custom content per page */}
        {rightSlot && <div className="flex items-center gap-2">{rightSlot}</div>}

        <Separator orientation="vertical" className="h-5 hidden lg:block" />

        {/* Progress pill — desktop only */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy size={12} style={{ color: "#fbbf24" }} />
          <span>
            <span className="font-semibold text-foreground tabular-nums">{masteredPct}%</span>
            {" "}mastered
          </span>
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${masteredPct}%`, background: "var(--app-green)" }}
            />
          </div>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/zer0-XD/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubIcon size={17} />
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
      </div>
    </header>
  );
}

export default function PageTopBar({ title, description, rightSlot }) {
  return (
    <Suspense fallback={<div className="h-14 shrink-0 bg-card border-b border-border" />}>
      <TopBarInner title={title} description={description} rightSlot={rightSlot} />
    </Suspense>
  );
}
