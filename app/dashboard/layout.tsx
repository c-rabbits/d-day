import { DashboardBottomNav } from "@/components/dashboard-bottom-nav";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-none pb-24">{children}</div>
      <Suspense fallback={<div className="fixed bottom-0 left-1/2 z-30 h-[76px] w-full max-w-mobile -translate-x-1/2" />}>
        <DashboardBottomNav />
      </Suspense>
    </main>
  );
}
