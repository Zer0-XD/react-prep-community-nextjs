"use client";

import { createContext, useContext, useState, useEffect } from "react";

const NavStyleContext = createContext({ navStyle: "sidebar", setNavStyle: () => {} });

export function useNavStyle() {
  return useContext(NavStyleContext);
}

export default function NavStyleProvider({ children }) {
  const [navStyle, setNavStyleState] = useState("sidebar");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nav-style");
      if (stored === "topnav" || stored === "sidebar") {
        setNavStyleState(stored);
      }
    } catch {}
    setMounted(true);
  }, []);

  function setNavStyle(style) {
    setNavStyleState(style);
    try {
      localStorage.setItem("nav-style", style);
    } catch {}
  }

  return (
    <NavStyleContext.Provider value={{ navStyle, setNavStyle, mounted }}>
      {children}
    </NavStyleContext.Provider>
  );
}
