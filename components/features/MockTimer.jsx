"use client";

import { useEffect, useState, useRef } from "react";
import { Timer, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const PRESETS = [30, 60, 90, 120];

export default function MockTimer({ onExpire }) {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            onExpire?.();
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, onExpire]);

  function handlePreset(seconds) {
    clearInterval(intervalRef.current);
    setDuration(seconds);
    setRemaining(seconds);
    setRunning(false);
  }

  function handleStart() {
    setRemaining(duration);
    setRunning(true);
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(duration);
  }

  const pct = duration > 0 ? (remaining / duration) * 100 : 0;
  const timerColor =
    pct <= 0
      ? "text-muted-foreground"
      : pct < 25
        ? "text-red-400"
        : pct < 50
          ? "text-amber-400"
          : "text-emerald-500";

  const progressColor =
    pct <= 0 ? "" : pct < 25 ? "#f87171" : pct < 50 ? "#fbbf24" : "var(--app-green)";

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 bg-muted border border-border">
      <Timer size={13} className="text-muted-foreground shrink-0" />

      <span className={`font-mono text-sm font-bold tabular-nums w-10 leading-none ${timerColor}`}>
        {mm}:{ss}
      </span>

      <div className="w-14">
        <div className="h-1 rounded-full overflow-hidden bg-muted">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${pct}%`, background: progressColor }}
          />
        </div>
      </div>

      <div className="flex gap-0.5">
        {PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => handlePreset(s)}
            className="px-1.5 py-0.5 rounded transition-all text-[10px]"
            style={{
              background: duration === s ? "var(--app-green)" : "transparent",
              color: duration === s ? "#000" : "var(--muted-foreground)",
              fontWeight: duration === s ? "600" : "400",
            }}
          >
            {s}s
          </button>
        ))}
      </div>

      {!running ? (
        <Button
          size="sm"
          onClick={handleStart}
          className="h-6 px-2 text-[11px] gap-1"
          style={{ background: "var(--app-green)", color: "#000" }}
        >
          <Play size={10} />
          Start
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleReset}
          className="h-6 px-2 text-[11px] gap-1"
        >
          <RotateCcw size={10} />
          Reset
        </Button>
      )}
    </div>
  );
}
