"use client";

import { cn } from "@/lib/utils";

type VectorHeroProps = {
  className?: string;
  variant?: "default" | "compact";
};

export function VectorHero({ className, variant = "default" }: VectorHeroProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-outline-variant/70 bg-gradient-to-br from-primary-container/65 via-surface to-surface-container p-4 shadow-[0_24px_50px_-36px_rgba(15,23,42,0.5)]",
        isCompact ? "h-44" : "h-64",
        className,
      )}
    >
      <div className="bg-grid-soft absolute inset-0 opacity-40" />

      <svg
        viewBox="0 0 360 220"
        aria-hidden
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id="vectorHeroGradientA" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.9)" />
            <stop offset="100%" stopColor="hsl(var(--secondary) / 0.7)" />
          </linearGradient>
          <radialGradient id="vectorHeroGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.25)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
          </radialGradient>
        </defs>

        <circle
          cx="85"
          cy="88"
          r="55"
          fill="url(#vectorHeroGlow)"
          className="animate-float-gentle"
        />
        <circle
          cx="278"
          cy="146"
          r="64"
          fill="url(#vectorHeroGlow)"
          className="animate-float-reverse"
        />

        <g className="animate-orbit-slow opacity-70">
          <circle cx="184" cy="106" r="68" fill="none" stroke="hsl(var(--outline-variant) / 0.75)" />
          <circle cx="252" cy="106" r="8" fill="hsl(var(--primary))" />
          <circle cx="116" cy="106" r="7" fill="hsl(var(--secondary))" />
        </g>

        <path
          d="M38 150C84 118 126 180 172 146C218 112 260 172 322 126"
          fill="none"
          stroke="url(#vectorHeroGradientA)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="10 14"
          className="animate-stroke-loop"
        />
      </svg>

      <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-outline-variant/60 bg-surface/80 px-3 py-2 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-muted-foreground">
            계약 만료 리마인더를 스마트하게 정리하세요
          </p>
          <span className="animate-pulse-soft h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
