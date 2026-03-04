import AppShell from "@/components/features/AppShell";

export default function QuestionsLayout({ children }) {
  return (
    <AppShell title="All Questions" description="304 React interview Q&As">
      {children}
    </AppShell>
  );
}
