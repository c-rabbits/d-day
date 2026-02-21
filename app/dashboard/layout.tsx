import { AuthButton } from "@/components/auth-button";
import { DashboardBottomNav } from "@/components/dashboard-bottom-nav";
import { PushEnable } from "@/components/push-enable";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.09),transparent_42%),radial-gradient(circle_at_100%_100%,hsl(var(--secondary)/0.08),transparent_38%)]" />

      <header className="sticky top-0 z-10 border-b border-outline-variant/70 bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.35rem] w-full max-w-mobile items-center justify-between px-4">
          <Link href="/dashboard" className="flex flex-col leading-none">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-primary">
              D-DAY
            </span>
            <span className="mt-1 text-lg font-semibold text-foreground">디데이</span>
          </Link>

          <div className="flex items-center gap-2">
            <PushEnable />
            {hasEnvVars && (
              <Suspense fallback={null}>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex-1 pb-24">{children}</div>
      <DashboardBottomNav />
    </main>
  );
}
