"use client";

import { useState } from "react";
import { Sun, Moon, Trash2, Trophy, RotateCcw, PanelLeft, PanelTop } from "lucide-react";
import { useTheme } from "@/components/features/ThemeProvider";
import { useNavStyle } from "@/components/features/NavStyleProvider";
import { useColorScheme, COLOR_SCHEMES } from "@/components/features/ColorSchemeProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { TOTAL_QUESTIONS } from "@/lib/constants";

function SettingSection({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-xs mt-0.5 text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="px-5 py-4 space-y-4">{children}</div>
    </div>
  );
}

function SettingRow({ label, description, control }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggle, mounted } = useTheme();
  const { navStyle, setNavStyle } = useNavStyle();
  const { scheme, setScheme } = useColorScheme();
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  function getStats() {
    try {
      const stored = localStorage.getItem("react-prep-confidence");
      if (stored) {
        const vals = Object.values(JSON.parse(stored));
        return {
          mastered: vals.filter((v) => v === "mastered").length,
          reviewing: vals.filter((v) => v === "reviewing").length,
          hard: vals.filter((v) => v === "hard").length,
          rated: vals.length,
        };
      }
    } catch { }
    return { mastered: 0, reviewing: 0, hard: 0, rated: 0 };
  }

  const stats = getStats();
  const masteredPct = Math.round((stats.mastered / TOTAL_QUESTIONS) * 100);

  function handleReset() {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    try {
      localStorage.removeItem("react-prep-confidence");
    } catch { }
    setResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 2500);
  }

  return (
    <div className="p-5 lg:p-6 max-w-2xl mx-auto space-y-5">
      {/* Appearance */}
      <SettingSection
        title="Appearance"
        description="Customize how the app looks"
      >
        <SettingRow
          label="Color theme"
          description="Switch between light and dark mode"
          control={
            <Button
              variant="outline"
              size="sm"
              onClick={toggle}
              className="h-8 gap-2 rounded-xl min-w-28"
            >
              {mounted && (
                <>
                  {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                  <span className="text-xs">
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                  </span>
                </>
              )}
            </Button>
          }
        />
        <SettingRow
          label="Accent color"
          description="Choose an accent color for the app"
          control={
            <div className="flex gap-2">
              {COLOR_SCHEMES.map((s) => (
                <button
                  key={s.id}
                  title={s.label}
                  onClick={() => setScheme(s.id)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    scheme === s.id
                      ? "border-foreground scale-110 shadow-sm"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ background: theme === "dark" ? s.dark : s.light }}
                />
              ))}
            </div>
          }
        />
        <SettingRow
          label="Navigation style"
          description="Choose between a sidebar or a top navigation bar"
          control={
            <div className="flex gap-1.5 p-1 rounded-xl bg-muted border border-border">
              {[
                { value: "sidebar", label: "Sidebar", icon: PanelLeft },
                { value: "topnav", label: "Top bar", icon: PanelTop },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setNavStyle(value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                    navStyle === value
                      ? "bg-card text-foreground shadow-sm border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          }
        />
      </SettingSection>

      {/* Progress */}
      <SettingSection
        title="Progress"
        description="Your confidence ratings across all 304 questions"
      >
        {/* Stats display */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Rated", value: stats.rated, color: "var(--app-green)" },
            { label: "Mastered", value: stats.mastered, color: "var(--c-mastered-fg)" },
            { label: "Reviewing", value: stats.reviewing, color: "var(--c-reviewing-fg)" },
            { label: "Hard", value: stats.hard, color: "var(--c-hard-fg)" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center border border-border bg-muted/30"
            >
              <div className="text-xl font-bold tabular-nums" style={{ color }}>
                {value}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={11} style={{ color: "#fbbf24" }} />
              <span>Overall mastery</span>
            </div>
            <span className="font-semibold text-foreground tabular-nums">{masteredPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${masteredPct}%`, background: "var(--app-green)" }}
            />
          </div>
        </div>

        <Separator />

        {/* Reset */}
        <SettingRow
          label="Reset progress"
          description="Clear all confidence ratings. This cannot be undone."
          control={
            resetDone ? (
              <span className="text-xs font-medium" style={{ color: "var(--app-green)" }}>
                Reset ✓
              </span>
            ) : (
              <Button
                variant={resetConfirm ? "destructive" : "outline"}
                size="sm"
                onClick={handleReset}
                className="h-8 gap-1.5 rounded-xl text-xs min-w-28"
                onBlur={() => setResetConfirm(false)}
              >
                {resetConfirm ? (
                  <>
                    <Trash2 size={13} />
                    Confirm reset
                  </>
                ) : (
                  <>
                    <RotateCcw size={13} />
                    Reset progress
                  </>
                )}
              </Button>
            )
          }
        />
      </SettingSection>

      {/* About */}
      <SettingSection title="About" description="App information">
        <SettingRow
          label="Total questions"
          description="All React interview Q&As"
          control={
            <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--app-green)" }}>
              {TOTAL_QUESTIONS}
            </span>
          }
        />
      </SettingSection>
    </div>
  );
}
