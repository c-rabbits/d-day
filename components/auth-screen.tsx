"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { VectorHero } from "@/components/vector-hero";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  backHref?: string;
  badge?: string;
  children: React.ReactNode;
};

export function AuthScreen({
  title,
  subtitle,
  backHref = "/",
  badge,
  children,
}: AuthScreenProps) {
  return (
    <div className="relative flex min-h-svh w-full flex-col overflow-hidden bg-[hsl(var(--auth-header))]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.26),transparent_45%),radial-gradient(circle_at_100%_60%,hsl(var(--secondary)/0.18),transparent_40%)]" />

      <header className="relative px-4 pt-7 pb-10">
        <Link
          href={backHref}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22"
          aria-label="뒤로"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>

        <div className="mt-6 space-y-2.5">
          {badge && (
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-[11px] font-medium tracking-wide text-white/85">
              {badge}
            </span>
          )}
          <h1 className="text-[2.05rem] font-bold leading-tight text-white">{title}</h1>
          <p className="max-w-[330px] text-[0.95rem] leading-relaxed text-white/82">
            {subtitle}
          </p>
        </div>

        <VectorHero variant="compact" className="mt-7 border-white/20 bg-white/10" />
      </header>

      <div className="relative flex-1 rounded-t-[2rem] bg-surface px-7 pt-9 pb-12 shadow-[0_-20px_60px_-40px_rgba(0,0,0,0.65)]">
        <div className="mx-auto w-full max-w-[390px]">{children}</div>
      </div>
    </div>
  );
}
