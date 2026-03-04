import AppShell from "@/components/features/AppShell";

export default function FlashcardLayout({ children }) {
  return (
    <AppShell fullHeight>
      {children}
    </AppShell>
  );
}
