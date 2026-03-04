"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  X,
  Trophy,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TOTAL_QUESTIONS } from "@/lib/constants";

const NAV_ITEMS = [
  { href: "/questions", label: "All Questions", icon: LayoutGrid },
  { href: "/flashcard", label: "Flashcards", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function MobileSidebarContent({ onClose }) {
  const pathname = usePathname();

  const [stats, setStats] = useState({ mastered: 0, reviewing: 0, hard: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("react-prep-confidence");
      if (stored) {
        const conf = JSON.parse(stored);
        const vals = Object.values(conf);
        setStats({
          mastered: vals.filter((v) => v === "mastered").length,
          reviewing: vals.filter((v) => v === "reviewing").length,
          hard: vals.filter((v) => v === "hard").length,
        });
      }
    } catch { }
  }, [pathname]);

  const masteredPct = Math.round((stats.mastered / TOTAL_QUESTIONS) * 100);

  return (
    <div className="w-full h-full flex flex-col select-none bg-sidebar-accent overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-[18px]"
        style={{ borderBottom: "1px solid var(--sb-border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: "var(--sb-accent)", color: "#000" }}
          >
            ⚛
          </div>
          <div>
            <div className="text-sm font-semibold text-black dark:text-white leading-none mb-0.5">
              React Prep
            </div>
            <div className="text-xs leading-none" style={{ color: "var(--sb-fg)" }}>
              Interview Dashboard
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7 hover:bg-white/5"
          style={{ color: "var(--sb-fg)" }}
        >
          <X size={15} />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <div
          className="px-3 mb-3 font-semibold uppercase"
          style={{ color: "var(--sb-fg)", fontSize: "10px", letterSpacing: "0.1em" }}
        >
          Study
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative",
                isActive
                  ? "text-black dark:text-white bg-primary/50"
                  : "hover:text-[#cccccc]"
              )}
            >
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: "var(--sb-accent)" }}
                />
              )}
              <Icon
                size={16}
                style={{
                  color: isActive ? "var(--sb-accent)" : "inherit",
                  opacity: isActive ? 1 : 0.55,
                }}
              />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator style={{ background: "var(--sb-border)" }} />

      {/* Progress */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <Trophy size={12} style={{ color: "#fbbf24" }} className="shrink-0" />
          <span className="text-xs font-medium" style={{ color: "var(--sb-fg)" }}>
            Progress
          </span>
          <span className="ml-auto text-xs font-bold text-white tabular-nums">
            {masteredPct}%
          </span>
        </div>

        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${masteredPct}%`, background: "var(--sb-accent)" }}
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "Mastered", value: stats.mastered, color: "#3ecf8e" },
            { label: "Review", value: stats.reviewing, color: "#fbbf24" },
            { label: "Hard", value: stats.hard, color: "#f87171" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-lg px-2 py-2 text-center"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="text-sm font-bold leading-none tabular-nums" style={{ color }}>
                {value}
              </div>
              <div
                className="mt-1 leading-none"
                style={{ color: "var(--sb-fg)", fontSize: "10px" }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <Separator style={{ background: "var(--sb-border)" }} /> */}

      {/* Footer */}
      <div className="px-4 py-3">
        <a
          href="https://github.com/Zer0-XD/frontend-prep-nextjs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors hover:text-white"
          style={{ color: "var(--sb-fg)", fontSize: "11px" }}
        >

          <GithubIcon size={18} />
        </a>
      </div>
    </div>
  );
}
