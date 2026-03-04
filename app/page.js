"use client";

import Link from "next/link";
import { useState } from "react";
import { LayoutGrid, BookOpen, Trophy } from "lucide-react";
import AppShell from "@/components/features/AppShell";
import { TOTAL_QUESTIONS } from "@/lib/constants";

const PAGES = [
  {
    href: "/questions",
    label: "All Questions",
    description: "Browse all 304 React interview Q&As with confidence tracking, section filters, and instant search.",
    icon: LayoutGrid,
    blob: (
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="g1a" cx="30%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#3ecf8e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3ecf8e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g1b" cx="75%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="blob-path-1a" d="M80,60 C120,20 200,10 260,50 C320,90 360,160 330,220 C300,280 200,300 130,270 C60,240 20,180 30,120 C40,80 60,80 80,60Z"
          fill="url(#g1a)" />
        <path className="blob-path-1b" d="M200,80 C260,60 340,90 360,160 C380,230 320,290 240,280 C160,270 100,220 110,150 C120,90 160,95 200,80Z"
          fill="url(#g1b)" />
      </svg>
    ),
    accent: "#3ecf8e",
  },
  {
    href: "/flashcard",
    label: "Flashcards",
    description: "Flip through questions one by one. Rate your confidence, use the timer, and track progress.",
    icon: BookOpen,
    blob: (
      <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="g2a" cx="65%" cy="25%" r="55%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g2b" cx="25%" cy="75%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="blob-path-2a" d="M60,80 C100,30 190,15 270,55 C350,95 380,180 340,240 C300,300 190,310 110,270 C30,230 10,160 25,110 C35,75 45,105 60,80Z"
          fill="url(#g2a)" />
        <path className="blob-path-2b" d="M150,50 C220,30 320,70 350,150 C380,230 310,300 220,290 C130,280 70,220 80,140 C90,75 110,65 150,50Z"
          fill="url(#g2b)" />
      </svg>
    ),
    accent: "#818cf8",
  },
];

export default function HomePage() {
  const [stats] = useState(() => {
    try {
      const stored = typeof window !== "undefined" && localStorage.getItem("react-prep-confidence");
      if (stored) {
        const vals = Object.values(JSON.parse(stored));
        return {
          mastered: vals.filter((v) => v === "mastered").length,
          reviewing: vals.filter((v) => v === "reviewing").length,
          hard: vals.filter((v) => v === "hard").length,
        };
      }
    } catch { }
    return { mastered: 0, reviewing: 0, hard: 0 };
  });

  const masteredPct = Math.round((stats.mastered / TOTAL_QUESTIONS) * 100);
  const rated = stats.mastered + stats.reviewing + stats.hard;

  return (
    <AppShell title="React Prep" description="Interview dashboard">
      <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 gap-12">
        {/* Hero */}
        <div className="text-center max-w-xl">
          <div
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full mb-5 border"
            style={{
              background: "color-mix(in srgb, var(--app-green) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--app-green) 25%, transparent)",
              color: "var(--app-green)",
            }}
          >
            <Trophy size={11} />
            {masteredPct}% mastered · {rated} / {TOTAL_QUESTIONS} rated
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Ace your React<br />
            <span style={{ color: "var(--app-green)" }}>interview</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
            Curated list of questions with flashcards, confidence tracking, and live coding exercises.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          {PAGES.map(({ href, label, description, icon: Icon, blob, accent }) => (
            <Link
              key={href}
              href={href}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Blob background */}
              <div className="absolute inset-0 opacity-80 pointer-events-none select-none transition-opacity duration-300 group-hover:opacity-100">
                {blob}
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${accent} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${accent} 25%, transparent)`,
                  }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>

                <div>
                  <div className="font-semibold text-foreground text-sm">{label}</div>
                  <p className="text-xs mt-1.5 text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Arrow */}
              <div
                className="relative z-10 flex items-center gap-1 text-xs font-medium transition-all duration-200 group-hover:gap-2"
                style={{ color: accent }}
              >
                Open
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Progress strip */}
        {rated > 0 && (
          <div className="w-full max-w-3xl">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Overall progress</span>
              <span className="tabular-nums font-medium text-foreground">{stats.mastered} mastered</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${masteredPct}%`, background: "var(--app-green)" }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span><span className="font-semibold" style={{ color: "var(--app-green)" }}>{stats.mastered}</span> mastered</span>
              <span><span className="font-semibold text-yellow-400">{stats.reviewing}</span> reviewing</span>
              <span><span className="font-semibold text-red-400">{stats.hard}</span> hard</span>
              <span className="ml-auto">{TOTAL_QUESTIONS - rated} unrated</span>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
