"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const COLOR_SCHEMES = [
  { id: "violet", label: "Violet", light: "#8b5cf6", dark: "#a78bfa" },
  { id: "emerald", label: "Emerald", light: "#10b981", dark: "#3ecf8e" },
  { id: "ocean", label: "Ocean", light: "#0ea5e9", dark: "#38bdf8" },
  { id: "amber", label: "Amber", light: "#f59e0b", dark: "#fbbf24" },
  { id: "rose", label: "Rose", light: "#f43f5e", dark: "#fb7185" },
];

const LS_KEY = "color-scheme";
const DEFAULT = "violet";

const ColorSchemeContext = createContext({
  scheme: DEFAULT,
  setScheme: () => {},
  mounted: false,
});

export const useColorScheme = () => useContext(ColorSchemeContext);

export default function ColorSchemeProvider({ children }) {
  const [scheme, setSchemeState] = useState(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) || DEFAULT;
    setSchemeState(saved);
    document.documentElement.setAttribute("data-scheme", saved);
    setMounted(true);
  }, []);

  function setScheme(id) {
    setSchemeState(id);
    document.documentElement.setAttribute("data-scheme", id);
    try {
      localStorage.setItem(LS_KEY, id);
    } catch {}
  }

  return (
    <ColorSchemeContext.Provider value={{ scheme, setScheme, mounted }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}
