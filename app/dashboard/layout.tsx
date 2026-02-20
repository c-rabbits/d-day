import { AuthButton } from "@/components/auth-button";
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
    <main className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/dashboard" className="font-semibold text-lg text-foreground">
            디데이
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
      <div className="flex-1 pb-24">{children}</div>
      <Link
        href="/dashboard/contracts/new"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        aria-label="계약 추가"
      >
        <span className="text-2xl leading-none">+</span>
      </Link>
    </main>
  );
}
