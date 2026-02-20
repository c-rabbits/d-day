"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type AuthScreenProps = {
  title: string;
  subtitle: string;
  backHref?: string;
  children: React.ReactNode;
};

export function AuthScreen({
  title,
  subtitle,
  backHref = "/",
  children,
}: AuthScreenProps) {
  return (
    <div className="flex min-h-svh w-full flex-col bg-[hsl(var(--auth-header))]">
      <header className="relative px-4 pt-6 pb-10">
        <Link
          href={backHref}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          aria-label="뒤로"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm text-white/80">{subtitle}</p>
        </div>
      </header>
      <div className="flex-1 rounded-t-3xl bg-white px-6 pt-8 pb-10">
        {children}
      </div>
    </div>
  );
}
