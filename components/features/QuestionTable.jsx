"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchFilter from "@/components/features/SearchFilter";
import SectionBadge from "@/components/features/SectionBadge";
import ConfidenceBadge from "@/components/features/ConfidenceBadge";
import {
  BookOpen,
  Code2,
  Brain,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AnswerRenderer from "@/components/features/AnswerRenderer";

const CONFIDENCE_LEVELS = ["all", "mastered", "reviewing", "hard", "unrated"];
const CONFIDENCE_CYCLE = ["unrated", "mastered", "reviewing", "hard"];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 10;

const CONFIDENCE_ACTIONS = [
  { level: "mastered", label: "Mastered", emoji: "✓", bg: "var(--c-mastered-bg)", fg: "var(--c-mastered-fg)", border: "var(--c-mastered-border)" },
  { level: "reviewing", label: "Reviewing", emoji: "~", bg: "var(--c-reviewing-bg)", fg: "var(--c-reviewing-fg)", border: "var(--c-reviewing-border)" },
  { level: "hard", label: "Hard", emoji: "!", bg: "var(--c-hard-bg)", fg: "var(--c-hard-fg)", border: "var(--c-hard-border)" },
];

// ── Row variants ────────────────────────────────────────────────
const rowVariants = {
  hidden: { opacity: 0 },
  visible: (i) => ({ opacity: 1, transition: { delay: i * 0.025, duration: 0.2, ease: "easeOut" } }),
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.18, ease: "easeIn" } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] } }),
};

export default function QuestionTable({ questions }) {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [confidenceFilter, setConfidenceFilter] = useState("all");
  const [confidence, setConfidence] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [navDirection, setNavDirection] = useState(1); // 1 = forward, -1 = backward
  const [filterKey, setFilterKey] = useState(0); // triggers row re-animation on filter change

  useEffect(() => {
    try {
      const stored = localStorage.getItem("react-prep-confidence");
      if (stored) setConfidence(JSON.parse(stored));
    } catch { }
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelectedQuestion(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selectedQuestion ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedQuestion]);

  const sections = useMemo(() => [...new Set(questions.map((q) => q.section))], [questions]);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = q.question.toLowerCase().includes(search.toLowerCase());
      const matchSection = sectionFilter === "all" || q.section === sectionFilter;
      const qLevel = confidence[String(q.id)] ?? "unrated";
      const matchConfidence = confidenceFilter === "all" || qLevel === confidenceFilter;
      return matchSearch && matchSection && matchConfidence;
    });
  }, [questions, search, sectionFilter, confidenceFilter, confidence]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  useMemo(() => { setPage(1); setFilterKey((k) => k + 1); }, [search, sectionFilter, confidenceFilter]); // eslint-disable-line

  const stats = useMemo(() => {
    const total = questions.length;
    const mastered = Object.values(confidence).filter((v) => v === "mastered").length;
    const reviewing = Object.values(confidence).filter((v) => v === "reviewing").length;
    const hard = Object.values(confidence).filter((v) => v === "hard").length;
    return { total, mastered, reviewing, hard };
  }, [questions, confidence]);

  function cycleConfidence(id, e) {
    e?.stopPropagation();
    const current = confidence[String(id)] ?? "unrated";
    const nextIndex = (CONFIDENCE_CYCLE.indexOf(current) + 1) % CONFIDENCE_CYCLE.length;
    const next = CONFIDENCE_CYCLE[nextIndex];
    const updated = { ...confidence, [String(id)]: next };
    setConfidence(updated);
    // also update in selectedQuestion view
    if (selectedQuestion?.id === id) {
      setSelectedQuestion((q) => ({ ...q, _level: next }));
    }
    try { localStorage.setItem("react-prep-confidence", JSON.stringify(updated)); } catch { }
  }

  function setConfidenceDirect(id, level) {
    const updated = { ...confidence, [String(id)]: level };
    setConfidence(updated);
    setSelectedQuestion((q) => q ? { ...q, _level: level } : q);
    try { localStorage.setItem("react-prep-confidence", JSON.stringify(updated)); } catch { }
  }

  const STAT_CARDS = [
    { label: "Total", value: stats.total, icon: Brain, iconColor: "var(--app-green)", bg: "var(--stat-total-bg)", border: "var(--stat-total-border)" },
    { label: "Mastered", value: stats.mastered, icon: BookOpen, iconColor: "var(--c-mastered-fg)", bg: "var(--stat-mastered-bg)", border: "var(--stat-mastered-border)" },
    { label: "Reviewing", value: stats.reviewing, icon: SlidersHorizontal, iconColor: "var(--c-reviewing-fg)", bg: "var(--stat-reviewing-bg)", border: "var(--stat-reviewing-border)" },
    { label: "Hard", value: stats.hard, icon: AlertCircle, iconColor: "var(--c-hard-fg)", bg: "var(--stat-hard-bg)", border: "var(--stat-hard-border)" },
  ];

  const activeFiltersCount = [search, sectionFilter !== "all" ? sectionFilter : null, confidenceFilter !== "all" ? confidenceFilter : null].filter(Boolean).length;

  return (
    <div className="p-5 lg:p-6 space-y-5 max-w-475 mx-auto">

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_CARDS.map(({ label, value, icon: Icon, iconColor, bg, border }, i) => (
          <motion.div
            key={label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl p-4 flex items-center gap-3 border relative overflow-hidden group cursor-default select-none"
            style={{ background: bg, borderColor: border }}
            whileHover={{ scale: 1, transition: { duration: 0.15 } }}
          >
            {/* subtle glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
              style={{ background: `radial-gradient(circle at 30% 50%, color-mix(in srgb, ${iconColor} 12%, transparent), transparent 70%)` }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative z-10"
              style={{ background: `color-mix(in srgb, ${iconColor} 14%, transparent)` }}
            >
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <div className="min-w-0 relative z-10">
              <motion.div
                key={value}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold leading-none tabular-nums text-foreground"
              >
                {value}
              </motion.div>
              <div className="text-xs mt-1 leading-none text-muted-foreground">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── Filter sidebar ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.3, delay: 0.15 } }}
          className="rounded-2xl border border-border bg-card overflow-hidden w-full lg:w-64 shrink-0 self-start lg:sticky lg:top-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <SlidersHorizontal size={14} style={{ color: "var(--app-green)" }} />
              Filters
            </div>
            {activeFiltersCount > 0 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => { setSearch(""); setSectionFilter("all"); setConfidenceFilter("all"); }}
                className="text-xs px-2 py-0.5 rounded-lg font-medium transition-all"
                style={{ background: "color-mix(in srgb, var(--app-green) 12%, transparent)", color: "var(--app-green)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear {activeFiltersCount}
              </motion.button>
            )}
          </div>

          <div className="p-3 space-y-3">
            {/* Search */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 px-1 font-medium">Search</div>
              <SearchFilter value={search} onChange={setSearch} />
            </div>

            {/* Section */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 px-1 font-medium">Section</div>
              <Select value={sectionFilter} onValueChange={setSectionFilter}>
                <SelectTrigger className="h-8 w-full text-sm rounded-xl">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Confidence */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 px-1 font-medium">Confidence</div>
              <div className="flex flex-wrap gap-1.5">
                {CONFIDENCE_LEVELS.map((l) => {
                  const isActive = confidenceFilter === l;
                  const colors = {
                    mastered: "var(--c-mastered-fg)",
                    reviewing: "var(--c-reviewing-fg)",
                    hard: "var(--c-hard-fg)",
                    unrated: "var(--c-unrated-fg)",
                    all: "var(--app-green)",
                  };
                  return (
                    <motion.button
                      key={l}
                      onClick={() => setConfidenceFilter(l)}
                      whileTap={{ scale: 0.93 }}
                      className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all border"
                      style={{
                        background: isActive ? `color-mix(in srgb, ${colors[l]} 14%, transparent)` : "transparent",
                        color: isActive ? colors[l] : "var(--muted-foreground)",
                        borderColor: isActive ? `color-mix(in srgb, ${colors[l]} 35%, transparent)` : "var(--border)",
                      }}
                    >
                      {l === "all" ? "All" : l.charAt(0).toUpperCase() + l.slice(1)}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Count pill */}
            <div className="pt-1 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "var(--app-green)" }}
                  animate={{ width: `${questions.length > 0 ? (filtered.length / questions.length) * 100 : 0}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                <span className="font-semibold text-foreground">{filtered.length}</span> / {questions.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Question list ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.2 } }}
          className="flex-1 min-w-0 space-y-2"
        >
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="rounded-2xl border border-border bg-card py-24 text-center"
              >
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-sm font-medium text-muted-foreground">No questions match your filters</div>
                <div className="text-xs mt-1 text-muted-foreground/60">Try adjusting your search or filter criteria</div>
              </motion.div>
            ) : (
              <motion.div key={`list-${filterKey}`} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.18 } }} exit={{ opacity: 0, transition: { duration: 0.12 } }} className="space-y-2">
                <AnimatePresence initial={false}>
                  {paginated.map((q, i) => {
                    const level = confidence[String(q.id)] ?? "unrated";
                    return (
                      <QuestionCard
                        key={q.id}
                        q={q}
                        index={i}
                        level={level}
                        onCycle={(e) => cycleConfidence(q.id, e)}
                        onClick={() => setSelectedQuestion({ ...q, _level: level })}
                        isNew={filterKey}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Pagination ──────────────────────────────────────── */}
          {filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3 } }}
              className="flex items-center justify-between px-1 pt-2"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Rows</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                  <SelectTrigger className="h-7 w-16 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs tabular-nums text-muted-foreground hidden sm:block">
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={safePage === 1}
                    onClick={() => { setPage((p) => p - 1); setFilterKey((k) => k + 1); }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center border border-border bg-card text-muted-foreground disabled:opacity-30 hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ChevronLeft size={13} />
                  </motion.button>
                  <span className="tabular-nums px-2 text-xs font-semibold text-foreground">
                    {safePage} / {totalPages}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={safePage === totalPages}
                    onClick={() => { setPage((p) => p + 1); setFilterKey((k) => k + 1); }}
                    className="h-7 w-7 rounded-lg flex items-center justify-center border border-border bg-card text-muted-foreground disabled:opacity-30 hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <ChevronRight size={13} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Question Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {selectedQuestion && (
          <QuestionModal
            q={selectedQuestion}
            navDirection={navDirection}
            confidence={confidence}
            onClose={() => setSelectedQuestion(null)}
            onCycleConfidence={(id, e) => cycleConfidence(id, e)}
            onSetConfidence={(id, level) => setConfidenceDirect(id, level)}
            allQuestions={filtered}
            onNavigate={(newQ, dir) => {
              setNavDirection(dir);
              setSelectedQuestion({ ...newQ, _level: confidence[String(newQ.id)] ?? "unrated" });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Question card row ────────────────────────────────────────────
function QuestionCard({ q, index, level, onCycle, onClick }) {
  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClick}
      className="group relative rounded-2xl border border-border bg-card px-4 py-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:border-[color-mix(in_srgb,var(--app-green)_35%,transparent)] select-none"
      whileHover={{
        y: -1,
        boxShadow: "0 4px 20px color-mix(in srgb, var(--app-green) 8%, transparent)",
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.995 }}
      style={{
        background: "var(--card)",
      }}
    >
      {/* ID bubble */}
      <div
        className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums mt-0.5 transition-colors"
        style={{
          background: "color-mix(in srgb, var(--app-green) 10%, transparent)",
          color: "var(--app-green)",
        }}
      >
        {q.id}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="text-sm font-medium text-foreground leading-relaxed line-clamp-2 group-hover:text-foreground transition-colors">
          {q.question}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <SectionBadge section={q.section} />
          {q.isCodingExercise && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border"
              style={{
                background: "color-mix(in srgb, #6366f1 10%, transparent)",
                color: "#818cf8",
                borderColor: "color-mix(in srgb, #6366f1 25%, transparent)",
              }}
            >
              <Code2 size={9} />
              Code
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="shrink-0 flex flex-col items-end gap-2 ml-2">
        <motion.button
          onClick={onCycle}
          whileTap={{ scale: 0.88 }}
          className="transition-transform"
          title="Click to cycle confidence"
        >
          <ConfidenceBadge level={level} />
        </motion.button>

        {/* Arrow hint */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 text-[10px] font-medium"
          style={{ color: "var(--app-green)" }}
        >
          Read <ArrowRight size={10} />
        </div>
      </div>

      {/* Left green accent line on hover */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{ background: "var(--app-green)" }}
      />
    </motion.div>
  );
}

// ── Modal content (keyed per question so revealed/savedLevel reset) ──
function ModalContent({ q, navDirection, currentLevel, scrollRef, hasPrev, hasNext, currentIndex, allQuestions, onNavigate, onSetConfidence }) {
  const [revealed, setRevealed] = useState(false);
  const [savedLevel, setSavedLevel] = useState(null);

  // Space/Enter to reveal
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === " " || e.key === "Enter") && !revealed) { e.preventDefault(); setRevealed(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed]);

  function handleRate(level) {
    onSetConfidence(q.id, level);
    setSavedLevel(level);
    setTimeout(() => setSavedLevel(null), 1500);
  }

  return (
    <>
      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence mode="wait" custom={navDirection}>
          <motion.div
            key={q.id}
            custom={navDirection}
            variants={{
              hidden: (dir) => ({ opacity: 0, x: dir * 48 }),
              visible: { opacity: 1, x: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
              exit: (dir) => ({ opacity: 0, x: dir * -48, transition: { duration: 0.15, ease: "easeIn" } }),
            }}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Question */}
            <div className="rounded-2xl border border-border p-5 relative overflow-hidden bg-foreground/5">
              <div
                className="absolute top-3 right-4 text-6xl font-black tabular-nums leading-none select-none pointer-events-none opacity-[0.04]"
                style={{ color: "var(--app-green)" }}
              >
                {q.id}
              </div>
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="shrink-0 mt-0.5" style={{ color: "var(--app-green)" }} />
                <h2 className="text-base font-semibold leading-relaxed text-foreground pr-10">{q.question}</h2>
              </div>
            </div>

            {/* Answer area */}
            <AnimatePresence mode="wait">
              {!revealed ? (
                <motion.div
                  key="reveal-btn"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex flex-col items-center py-8 gap-3"
                >
                  <motion.button
                    onClick={() => setRevealed(true)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
                    style={{
                      background: "var(--app-green)",
                      color: "#000",
                      boxShadow: "0 4px 16px color-mix(in srgb, var(--app-green) 35%, transparent)",
                    }}
                  >
                    <Eye size={15} />
                    Reveal Answer
                  </motion.button>
                  <div className="text-xs text-muted-foreground/60 flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">Space</kbd>
                    <span>to reveal</span>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Answer</span>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setRevealed(false)}
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <EyeOff size={11} /> Hide
                    </motion.button>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted/10 px-5 py-4">
                    <AnswerRenderer content={q.answer} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modal footer */}
      <div className="shrink-0 border-t border-border bg-card px-5 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">

          {/* Rate buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {revealed ? (
              <>
                <span className="text-xs text-muted-foreground">Rate:</span>
                <div className="flex gap-1.5">
                  {CONFIDENCE_ACTIONS.map(({ level, label, bg, fg, border }) => {
                    const isActive = currentLevel === level;
                    return (
                      <motion.button
                        key={level}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRate(level)}
                        className="h-7 px-3 text-xs font-semibold rounded-xl transition-all border"
                        style={{
                          background: isActive ? bg : "transparent",
                          color: fg,
                          borderColor: isActive ? border : "var(--border)",
                          opacity: isActive ? 1 : 0.55,
                        }}
                      >
                        {label}
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
                      className="text-xs font-medium"
                      style={{ color: "var(--app-green)" }}
                    >
                      Saved ✓
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="text-xs text-muted-foreground/60">
                Reveal answer to rate your confidence
              </div>
            )}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.9 }}
              disabled={!hasPrev}
              onClick={() => hasPrev && onNavigate(allQuestions[currentIndex - 1], -1)}
              className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1 border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={13} /> Prev
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              disabled={!hasNext}
              onClick={() => hasNext && onNavigate(allQuestions[currentIndex + 1], 1)}
              className="h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1 border border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              Next <ChevronRight size={13} />
            </motion.button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Question Modal ───────────────────────────────────────────────
function QuestionModal({ q, navDirection, confidence, onClose, onCycleConfidence, onSetConfidence, allQuestions, onNavigate }) {
  const currentLevel = confidence[String(q.id)] ?? "unrated";
  const currentIndex = allQuestions.findIndex((x) => x.id === q.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allQuestions.length - 1;
  const scrollRef = useRef(null);

  // Scroll to top on question change
  const prevIdRef = useRef(q.id);
  useEffect(() => {
    if (prevIdRef.current !== q.id) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      prevIdRef.current = q.id;
    }
  }, [q.id]);

  // Keyboard nav inside modal
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "n") { if (hasNext) onNavigate(allQuestions[currentIndex + 1], 1); }
      if (e.key === "ArrowLeft" || e.key === "p") { if (hasPrev) onNavigate(allQuestions[currentIndex - 1], -1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hasNext, hasPrev, currentIndex, allQuestions, onNavigate]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm h-screen"
      />

      {/* Modal panel */}
      <motion.div
        key="modal"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-x-4 top-[5vh] bottom-[5vh] z-50 max-w-3xl mx-auto rounded-3xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col"
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px color-mix(in srgb, var(--app-green) 15%, transparent)" }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg"
              style={{ background: "color-mix(in srgb, var(--app-green) 12%, transparent)", color: "var(--app-green)" }}
            >
              #{q.id}
            </span>
            <SectionBadge section={q.section} />
            {q.isCodingExercise && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border"
                style={{ background: "color-mix(in srgb, var(--app-primary) 10%, transparent)", color: "#818cf8", borderColor: "color-mix(in srgb, #6366f1 25%, transparent)" }}
              >
                <Code2 size={9} /> Code
              </span>
            )}
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentIndex + 1} / {allQuestions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Confidence badge clickable */}
            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => onCycleConfidence(q.id, e)} title="Click to cycle">
              <ConfidenceBadge level={currentLevel} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={14} />
            </motion.button>
          </div>
        </div>

        {/* Scrollable body + footer — ModalContent is keyed by q.id so revealed/savedLevel reset */}
        <ModalContent
          key={q.id}
          q={q}
          navDirection={navDirection}
          currentLevel={currentLevel}
          scrollRef={scrollRef}
          hasPrev={hasPrev}
          hasNext={hasNext}
          currentIndex={currentIndex}
          allQuestions={allQuestions}
          onNavigate={onNavigate}
          onSetConfidence={onSetConfidence}
        />
      </motion.div>
    </>
  );
}
