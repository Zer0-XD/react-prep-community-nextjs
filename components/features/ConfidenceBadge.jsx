const CONFIG = {
  mastered: {
    bg: "var(--c-mastered-bg)",
    fg: "var(--c-mastered-fg)",
    border: "var(--c-mastered-border)",
    label: "Mastered",
  },
  reviewing: {
    bg: "var(--c-reviewing-bg)",
    fg: "var(--c-reviewing-fg)",
    border: "var(--c-reviewing-border)",
    label: "Reviewing",
  },
  hard: {
    bg: "var(--c-hard-bg)",
    fg: "var(--c-hard-fg)",
    border: "var(--c-hard-border)",
    label: "Hard",
  },
  unrated: {
    bg: "var(--c-unrated-bg)",
    fg: "var(--c-unrated-fg)",
    border: "var(--c-unrated-border)",
    label: "Unrated",
  },
};

export default function ConfidenceBadge({ level = "unrated" }) {
  const { bg, fg, border, label } = CONFIG[level] ?? CONFIG.unrated;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ background: bg, color: fg, border: `1px solid ${border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: fg }} />
      {label}
    </span>
  );
}
