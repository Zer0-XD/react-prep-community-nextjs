"use client";

import { useNavStyle } from "@/components/features/NavStyleProvider";
import AppSidebar from "@/components/features/AppSidebar";
import PageTopBar from "@/components/features/PageTopBar";
import TopNavbar from "@/components/features/TopNavbar";

/**
 * AppShell — wraps page content with the correct navigation chrome
 * based on the user's nav style preference ("sidebar" or "topnav").
 *
 * Props:
 *   title        — page title shown in top bar (sidebar mode only)
 *   description  — subtitle shown in top bar (sidebar mode only)
 *   fullHeight   — if true, uses h-screen overflow-hidden (for coding/flashcard)
 *   children     — page content
 */
export default function AppShell({ title, description, fullHeight = false, children }) {
  const { navStyle, mounted } = useNavStyle();

  // Before hydration, render a neutral shell to avoid flash.
  // We use a data attribute set by the anti-flash script to pick the right chrome.
  const effective = mounted ? navStyle : "sidebar";

  if (effective === "topnav") {
    return (
      <div className={fullHeight ? "flex flex-col h-screen bg-background overflow-hidden" : "flex flex-col min-h-screen bg-background"}>
        <TopNavbar />
        <main className={fullHeight ? "flex flex-1 overflow-hidden" : "flex-1"}>
          {children}
        </main>
      </div>
    );
  }

  // sidebar (default)
  return (
    <div className={fullHeight ? "flex h-screen bg-background overflow-hidden" : "flex min-h-screen bg-background"}>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {title && <PageTopBar title={title} description={description} />}
        <main className={fullHeight ? "flex flex-1 overflow-hidden" : "flex-1 overflow-y-auto"}>
          {children}
        </main>
      </div>
    </div>
  );
}
