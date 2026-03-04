import AppShell from "@/components/features/AppShell";

export default function SettingsLayout({ children }) {
  return (
    <AppShell title="Settings" description="Preferences & customization">
      {children}
    </AppShell>
  );
}
