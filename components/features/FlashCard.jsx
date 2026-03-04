"use client";

import { useState, useEffect, useCallback, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowLeft,
  Keyboard,
  Zap,
  CheckCircle2,
  Shuffle,
  Flame,
  PenLine,
  X,
  Code2,
} from "lucide-react";
import SectionBadge from "@/components/features/SectionBadge";
import ConfidenceBadge from "@/components/features/ConfidenceBadge";
import AnswerRenderer from "@/components/features/AnswerRenderer";
import MockTimer from "@/components/features/MockTimer";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// ── Helpers ──────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Animation variants ───────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.14, ease: "easeOut" } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24, transition: { duration: 0.1, ease: "easeIn" } }),
};

const CONFIDENCE_ACTIONS = [
  { level: "mastered", label: "Mastered", key: "1", bg: "var(--c-mastered-bg)", fg: "var(--c-mastered-fg)", border: "var(--c-mastered-border)" },
  { level: "reviewing", label: "Reviewing", key: "2", bg: "var(--c-reviewing-bg)", fg: "var(--c-reviewing-fg)", border: "var(--c-reviewing-border)" },
  { level: "hard", label: "Hard", key: "3", bg: "var(--c-hard-bg)", fg: "var(--c-hard-fg)", border: "var(--c-hard-border)" },
];


// ── Whiteboard panel ─────────────────────────────────────────────
function WhiteboardPanel({ onClose }) {
  const [notes, setNotes] = useState("");
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div
        className="rounded-2xl border p-4 space-y-2"
        style={{
          background: "color-mix(in srgb, var(--app-green) 4%, var(--card))",
          borderColor: "color-mix(in srgb, var(--app-green) 18%, transparent)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--app-green)" }}>
            <PenLine size={12} /> Whiteboard
          </div>
          <div className="flex items-center gap-2">
            {notes && (
              <button onClick={() => setNotes("")} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">
                Clear
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Draft your approach, pseudocode, or key points before revealing the answer..."
          className="h-32 font-mono text-sm leading-relaxed resize-y bg-transparent border-border/50 focus-visible:ring-1 focus-visible:ring-[var(--app-green)]/40"
          autoFocus
        />
      </div>
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────
function FlashCardInner({ questions }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const targetId = searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const [shuffled, setShuffled] = useState(false);
  const [timeAttack, setTimeAttack] = useState(false);
  const [whiteboardOn, setWhiteboardOn] = useState(false);
  const [direction, setDirection] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [savedLevel, setSavedLevel] = useState(null);
  const [confidence, setConfidence] = useState({});

  // Build the ordered list (normal or shuffled)
  const orderedQuestions = useMemo(() => {
    if (shuffled) return shuffleArray(questions);
    return questions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffled, questions]);

  // Find start index from URL ?id= param
  const startIndex = useMemo(() => {
    if (!targetId) return 0;
    const idx = orderedQuestions.findIndex((q) => q.id === targetId);
    return idx >= 0 ? idx : 0;
  }, [orderedQuestions, targetId]);

  const [index, setIndex] = useState(startIndex);
  const current = orderedQuestions[index] ?? orderedQuestions[0];

  useEffect(() => {
    try {
      const stored = localStorage.getItem("react-prep-confidence");
      if (stored) setConfidence(JSON.parse(stored));
    } catch { }
  }, []);

  function saveConfidence(id, level) {
    const updated = { ...confidence, [String(id)]: level };
    setConfidence(updated);
    setSavedLevel(level);
    setTimeout(() => setSavedLevel(null), 1200);
    try { localStorage.setItem("react-prep-confidence", JSON.stringify(updated)); } catch { }
  }

  const navigate = useCallback((delta) => {
    setDirection(delta);
    setIndex((i) => Math.max(0, Math.min(i + delta, orderedQuestions.length - 1)));
    setRevealed(false);
    setTimerExpired(false);
    setWhiteboardOn(false);
  }, [orderedQuestions.length]);

  const goNext = useCallback(() => navigate(1), [navigate]);
  const goPrev = useCallback(() => navigate(-1), [navigate]);

  const handleTimerExpire = useCallback(() => {
    setTimerExpired(true);
    setRevealed(true);
  }, []);

  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey) return;
      switch (e.key) {
        case " ": case "Enter":
          if (!revealed) { e.preventDefault(); setRevealed(true); }
          break;
        case "ArrowRight": case "n": e.preventDefault(); goNext(); break;
        case "ArrowLeft": case "p": e.preventDefault(); goPrev(); break;
        case "1": if (revealed && current) saveConfidence(current.id, "mastered"); break;
        case "2": if (revealed && current) saveConfidence(current.id, "reviewing"); break;
        case "3": if (revealed && current) saveConfidence(current.id, "hard"); break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed, current, goNext, goPrev]);

  if (!current) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No questions available.
      </div>
    );
  }

  const currentLevel = confidence[String(current.id)] ?? "unrated";
  const progressPct = ((index + 1) / orderedQuestions.length) * 100;

  return (
    <div className="flex flex-col h-full bg-background w-full">

      {/* ── Animated progress bar ───────────────────────────── */}
      <div className="h-0.5 shrink-0 bg-border">
        <motion.div
          className="h-full"
          style={{ background: "var(--app-green)" }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 shrink-0 bg-card border-b border-border">

        {/* Left cluster */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/questions")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">All Questions</span>
          </motion.button>

          <Separator orientation="vertical" className="h-4 hidden sm:block" />

          <SectionBadge section={current.section} />

          {current.isCodingExercise && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border"
              style={{ background: "color-mix(in srgb, #6366f1 10%, transparent)", color: "#818cf8", borderColor: "color-mix(in srgb, #6366f1 25%, transparent)" }}
            >
              <Code2 size={9} /> Code
            </span>
          )}

          {/* Progress counter */}
          <span className="text-xs font-mono tabular-nums text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {index + 1} / {orderedQuestions.length}
          </span>

          <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
            const cycle = ["unrated", "mastered", "reviewing", "hard"];
            saveConfidence(current.id, cycle[(cycle.indexOf(currentLevel) + 1) % cycle.length]);
          }}>
            <ConfidenceBadge level={currentLevel} />
          </motion.button>
        </div>

        {/* Right cluster — mode toggles + timer */}
        <div className="flex items-center gap-2">

          {/* Whiteboard toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setWhiteboardOn((v) => !v)}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl text-[11px] font-medium border transition-all"
            style={{
              background: whiteboardOn ? "color-mix(in srgb, var(--app-green) 12%, transparent)" : "transparent",
              color: whiteboardOn ? "var(--app-green)" : "var(--muted-foreground)",
              borderColor: whiteboardOn ? "color-mix(in srgb, var(--app-green) 30%, transparent)" : "var(--border)",
            }}
          >
            <PenLine size={11} />
            <span className="hidden sm:inline">Notes</span>
          </motion.button>

          {/* Shuffle toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setShuffled((v) => !v); setIndex(0); setRevealed(false); }}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl text-[11px] font-medium border transition-all"
            style={{
              background: shuffled ? "color-mix(in srgb, #8b5cf6 12%, transparent)" : "transparent",
              color: shuffled ? "#a78bfa" : "var(--muted-foreground)",
              borderColor: shuffled ? "color-mix(in srgb, #8b5cf6 30%, transparent)" : "var(--border)",
            }}
          >
            <Shuffle size={11} />
            <span className="hidden sm:inline">Shuffle</span>
          </motion.button>

          {/* Time Attack toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setTimeAttack((v) => !v)}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded-xl text-[11px] font-medium border transition-all"
            style={{
              background: timeAttack ? "color-mix(in srgb, #f97316 12%, transparent)" : "transparent",
              color: timeAttack ? "#fb923c" : "var(--muted-foreground)",
              borderColor: timeAttack ? "color-mix(in srgb, #f97316 30%, transparent)" : "var(--border)",
            }}
          >
            <Flame size={11} />
            <span className="hidden sm:inline">Time Attack</span>
          </motion.button>

          {/* Timer — only visible when Time Attack is on */}
          <AnimatePresence>
            {timeAttack && (
              <motion.div
                key="timer"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.12 } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
              >
                <MockTimer onExpire={handleTimerExpire} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Main scrollable area ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-5 space-y-3">

          {/* Time Attack banner */}
          <AnimatePresence>
            {timeAttack && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs font-semibold bg-orange-500/8 border border-orange-500/20 text-orange-400">
                  <Flame size={13} />
                  Time Attack Mode — start the timer, then reveal the answer before time runs out!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Whiteboard panel */}
          <AnimatePresence>
            {whiteboardOn && (
              <WhiteboardPanel key="wb" onClose={() => setWhiteboardOn(false)} />
            )}
          </AnimatePresence>

          {/* Question card — slides on navigation */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${current.id}-${shuffled}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="rounded-2xl border overflow-hidden"
              style={{
                borderColor: "var(--border)",
                background: "var(--card)",
              }}
            >
              {/* Question section */}
              <div className="relative px-6 pt-6 pb-5 border-b border-border bg-card">
                {/* Ghost ID */}
                <div className="absolute top-3 right-5 text-7xl font-black tabular-nums leading-none select-none pointer-events-none text-border">
                  {current.id}
                </div>

                {/* Shuffle indicator */}
                {shuffled && (
                  <div className="flex items-center gap-1 text-[10px] font-medium mb-3 text-muted-foreground">
                    <Shuffle size={9} />
                    Random order
                  </div>
                )}

                <div className="flex items-start gap-3 pr-12">
                  <div className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mt-0.5 bg-muted">
                    <Zap size={13} style={{ color: "var(--app-green)" }} />
                  </div>
                  <h2 className="text-base font-semibold leading-relaxed text-foreground flex-1">
                    {current.question}
                  </h2>
                </div>
              </div>

              {/* Answer section */}
              <div className="px-6 py-5 space-y-4">

                {timerExpired && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.12 } }}
                    className="flex items-center gap-2 text-xs font-medium rounded-xl px-3 py-2.5 bg-red-500/8 border border-red-500/20 text-red-400"
                  >
                    ⏰ Time&apos;s up — answer revealed automatically.
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {!revealed ? (
                    <motion.div
                      key="hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex flex-col items-start gap-3 py-4"
                    >
                      <motion.button
                        onClick={() => setRevealed(true)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 h-10 px-6 rounded-xl text-sm font-semibold"
                        style={{
                          background: "var(--app-green)",
                          color: "#000",
                          boxShadow: "0 4px 16px color-mix(in srgb, var(--app-green) 30%, transparent)",
                        }}
                      >
                        <Eye size={15} />
                        Reveal Answer
                      </motion.button>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Space</kbd>
                        <span>to reveal</span>
                        <span className="mx-1 opacity-40">·</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">←→</kbd>
                        <span>to navigate</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="revealed"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} style={{ color: "var(--app-green)" }} />
                          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--app-green)" }}>
                            Answer
                          </span>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRevealed(false)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <EyeOff size={11} /> Hide
                        </motion.button>
                      </div>

                      <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4">
                        <AnswerRenderer content={current.answer} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="shrink-0 px-5 py-3 border-t border-border"
        style={{ background: "var(--card)" }}
      >
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-3">

          {/* Confidence rating */}
          <div className="flex items-center gap-2 flex-wrap">
            <AnimatePresence mode="wait">
              {revealed ? (
                <motion.div
                  key="rate"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <span className="text-xs text-muted-foreground">Rate:</span>
                  <div className="flex gap-1.5">
                    {CONFIDENCE_ACTIONS.map(({ level, label, key, bg, fg, border }) => {
                      const isActive = currentLevel === level;
                      return (
                        <motion.button
                          key={level}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => saveConfidence(current.id, level)}
                          className="h-7 px-3 text-xs font-semibold rounded-xl transition-all border"
                          style={{
                            background: isActive ? bg : "transparent",
                            color: fg,
                            borderColor: isActive ? border : "var(--border)",
                            opacity: isActive ? 1 : 0.55,
                          }}
                        >
                          {label}
                          <kbd className="hidden sm:inline ml-1.5 text-[10px] opacity-50 font-mono">{key}</kbd>
                        </motion.button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {savedLevel && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-xs font-semibold"
                        style={{ color: "var(--app-green)" }}
                      >
                        Saved ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Keyboard size={12} />
                  <span>Space to reveal · ←/→ or 1/2/3 to rate</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.92 }}
              disabled={index === 0}
              onClick={goPrev}
              className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1 border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={13} /> Prev
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              disabled={index === orderedQuestions.length - 1}
              onClick={goNext}
              className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1 border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight size={13} />
            </motion.button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function FlashCard({ questions }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">Loading…</div>
    }>
      <FlashCardInner questions={questions} />
    </Suspense>
  );
}
