"use client";

import Link from "next/link";
import { getDdayLabel, getDdayColorClass } from "@/lib/dday";
import { CATEGORY_LABELS, type ContractCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Calendar, FileText } from "lucide-react";

const CATEGORY_ICONS: Record<ContractCategory, React.ReactNode> = {
  RENT: "🏠",
  PHONE: "📱",
  CAR_INSURANCE: "🚗",
  GYM: "💪",
  RENTAL: "📦",
  STREAMING: "▶️",
  OTHER: "📄",
};

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  end_date: string;
  amount: number | null;
};

export function ContractList({ contracts }: { contracts: ContractRow[] }) {
  if (contracts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low/70 py-16 text-center opacity-0 animate-scale-in [animation-fill-mode:forwards]">
        <FileText className="mb-3 h-12 w-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">등록된 계약이 없어요</p>
        <p className="mt-1 text-xs text-muted-foreground">
          아래 + 버튼으로 첫 계약을 추가해 보세요
        </p>
      </div>
    );
  }

  const stagger = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6", "stagger-7", "stagger-8"];

  return (
    <ul className="space-y-3.5">
      {contracts.map((c, i) => (
        <li key={c.id} className={cn("opacity-0 animate-fade-in-up [animation-fill-mode:forwards]", stagger[Math.min(i, stagger.length - 1)])}>
          <Link
            href={`/dashboard/contracts/${c.id}`}
            className={cn(
              "group flex flex-col gap-4 rounded-2xl border border-outline-variant/70 bg-surface p-5 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-surface-container-low hover:shadow-md",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-xl"
                  aria-hidden
                >
                  {CATEGORY_ICONS[c.category]}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[1.02rem] font-semibold text-foreground">
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {CATEGORY_LABELS[c.category]}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-sm tabular-nums",
                  getDdayColorClass(c.end_date),
                )}
              >
                {getDdayLabel(c.end_date)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-right">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                만료일 {c.end_date}
              </span>
              {c.amount != null && (
                <span className="text-[0.95rem] font-semibold text-foreground">
                  {c.amount.toLocaleString()}원
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
