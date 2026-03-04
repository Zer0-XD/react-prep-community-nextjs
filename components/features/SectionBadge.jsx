// Colors are accent-based with low-opacity bg — works on both light and dark backgrounds
const SECTION_COLORS = {
  "Core React": "#3b82f6",
  "React Router": "#8b5cf6",
  "React Internationalization": "#14b8a6",
  "React Testing": "#ec4899",
  "React Redux": "#f97316",
  "React Native": "#84cc16",
  "React supported libraries & Integration": "#06b6d4",
  Miscellaneous: "#6b7280",
};

export default function SectionBadge({ section }) {
  const color = SECTION_COLORS[section] ?? "#6b7280";
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
      style={{
        background: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {section}
    </span>
  );
}
