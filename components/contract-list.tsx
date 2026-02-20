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
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16 text-center opacity-0 animate-scale-in [animation-fill-mode:forwards]">
        <FileText className="text-muted-foreground mb-3 h-12 w-12" />
        <p className="text-muted-foreground text-sm">등록된 계약이 없어요</p>
        <p className="text-muted-foreground mt-1 text-xs">
          아래 + 버튼으로 첫 계약을 추가해 보세요
        </p>
      </div>
    );
  }

  const stagger = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5", "stagger-6", "stagger-7", "stagger-8"];

  return (
    <ul className="space-y-2">
      {contracts.map((c, i) => (
        <li key={c.id} className={cn("opacity-0 animate-fade-in-up [animation-fill-mode:forwards]", stagger[Math.min(i, stagger.length - 1)])}>
          <Link
            href={`/dashboard/contracts/${c.id}`}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:bg-accent/50 hover:shadow-md hover:-translate-y-0.5",
            )}
          >
            <span className="text-2xl" aria-hidden>
              {CATEGORY_ICONS[c.category]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{c.title}</p>
              <p className="text-muted-foreground text-xs">
                {CATEGORY_LABELS[c.category]}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-right">
              <span className={cn("text-sm tabular-nums", getDdayColorClass(c.end_date))}>
                {getDdayLabel(c.end_date)}
              </span>
              {c.amount != null && (
                <span className="text-muted-foreground text-sm">
                  {c.amount.toLocaleString()}원
                </span>
              )}
              <Calendar className="text-muted-foreground h-4 w-4" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
