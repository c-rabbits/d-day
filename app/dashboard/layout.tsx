import { DashboardBottomNav } from "@/components/dashboard-bottom-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.09),transparent_42%),radial-gradient(circle_at_100%_100%,hsl(var(--secondary)/0.08),transparent_38%)]" />

      <Suspense fallback={<div className="h-[4.35rem] border-b border-outline-variant/70 bg-surface/85" />}>
        <DashboardHeader />
      </Suspense>

      <div className="relative flex-1 pb-24">{children}</div>
      <Suspense fallback={<div className="fixed bottom-0 left-1/2 z-30 h-[76px] w-full max-w-mobile -translate-x-1/2" />}>
        <DashboardBottomNav />
      </Suspense>
    </main>
  );
}
