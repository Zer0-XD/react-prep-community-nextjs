"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BookOpen, Settings, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/questions", label: "Questions", icon: LayoutGrid },
  { href: "/flashcard", label: "Flashcards", icon: BookOpen },
];

const BOTTOM_ITEMS = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarItem({ href, label, icon: Icon, isActive }) {
  const [tooltipPos, setTooltipPos] = useState(null);

  return (
    <Link
      href={href}
      title={label}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150",
        isActive && "bg-(--sb-accent)/45 text-black shadow-md"
      )}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: rect.right + 12, y: rect.top + rect.height / 2 });
      }}
      onMouseLeave={() => setTooltipPos(null)}
    >
      <Icon size={18} strokeWidth={isActive ? 1.4 : 1.0} />
      {/* Active indicator dot */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" />
      )}
      {/* Tooltip — portalled into <body> to escape overflow:hidden ancestors */}
      {tooltipPos !== null && typeof document !== "undefined" && createPortal(
        <span
          className="pointer-events-none px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap"
          style={{
            position: "fixed",
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translateY(-50%)",
            background: "#222",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            zIndex: 9999,
          }}
        >
          {label}
        </span>,
        document.body
      )}
    </Link>
  );
}

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex flex-col items-center shrink-0 w-[72px] py-8 gap-1  bg-black/5 dark:bg-white/5 text-black dark:text-white rounded-r-3xl"
      style={{
        height: "100dvh",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center justify-center w-10 h-10 rounded-xl mb-2 shrink-0 font-bold text-base"
        style={{ background: "var(--sb-accent)", color: "#000" }}
        title="React Prep"
      >
        ⚛
      </Link>

      {/* Divider */}
      <div className="w-6 h-px mb-1" style={{ background: "var(--sb-border)" }} />

      {/* Nav items */}
      <nav className="flex flex-col items-center flex-1 mb-20 justify-center gap-4">
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <SidebarItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            isActive={href === "/" ? pathname === "/" : pathname.startsWith(href)}
          />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 h-px mb-1" style={{ background: "var(--sb-border)" }} />
        {BOTTOM_ITEMS.map(({ href, label, icon }) => (
          <SidebarItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            isActive={pathname.startsWith(href)}
          />
        ))}
      </div>
    </aside>
  );
}
