"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_LABELS,
  CONTRACT_CATEGORIES,
  NOTIFY_DAYS_OPTIONS,
  type ContractCategory,
  type NotifyDaysBefore,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  start_date: string;
  end_date: string;
  amount: number | null;
  memo: string | null;
};

export function ContractEditForm({ contract }: { contract: ContractRow }) {
  const router = useRouter();
  const [title, setTitle] = useState(contract.title);
  const [category, setCategory] = useState<ContractCategory>(contract.category);
  const [startDate, setStartDate] = useState(contract.start_date);
  const [endDate, setEndDate] = useState(contract.end_date);
  const [amount, setAmount] = useState(contract.amount?.toString() ?? "");
  const [memo, setMemo] = useState(contract.memo ?? "");
  const [notifyDays, setNotifyDays] = useState<NotifyDaysBefore[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleNotify = (d: NotifyDaysBefore) => {
    setNotifyDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !startDate || !endDate) {
      setError("계약명, 시작일, 만료일을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          title: title.trim(),
          category,
          start_date: startDate,
          end_date: endDate,
          amount: amount ? parseFloat(amount.replace(/,/g, "")) || null : null,
          memo: memo.trim() || null,
        })
        .eq("id", contract.id);

      if (updateError) throw updateError;

      const end = new Date(endDate);
      const notificationsToInsert = notifyDays.map((d) => {
        const dte = new Date(end);
        dte.setDate(dte.getDate() - d);
        return {
          contract_id: contract.id,
          notify_days_before: d,
          scheduled_date: dte.toISOString().slice(0, 10),
        };
      });
      if (notificationsToInsert.length > 0) {
        await supabase.from("notifications").insert(notificationsToInsert);
      }
      router.push(`/dashboard/contracts/${contract.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-6 border-t border-outline-variant/70 bg-surface-container-low/35 pt-6">
        <div className="rounded-2xl border border-outline-variant/70 bg-surface p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-primary">EDIT MODE</p>
          <p className="mt-1 text-sm text-muted-foreground">
            필수 항목(계약명, 시작일, 만료일)을 확인한 뒤 저장해 주세요.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title">계약명 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label>카테고리</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {CONTRACT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    category === c
                      ? "border-primary bg-primary/10"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low",
                  )}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start_date">시작일 *</Label>
              <Input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">만료일 *</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">금액 (선택)</Label>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ""))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="memo">메모 (선택)</Label>
            <textarea
              id="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="min-h-[96px] w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm leading-relaxed shadow-sm transition-[border-color,box-shadow] focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>
          <div className="grid gap-2">
            <Label>알림 (추가 설정 시 선택)</Label>
            <div className="flex flex-wrap gap-2">
              {NOTIFY_DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleNotify(d)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-sm transition-colors",
                    notifyDays.includes(d)
                      ? "border-primary bg-primary/10"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low",
                  )}
                >
                  D-{d}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "저장 중…" : "저장"}
            </Button>
            <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/dashboard/contracts/${contract.id}`}>취소</Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
