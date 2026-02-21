"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getDdayLabel, getDdayColorClass } from "@/lib/dday";
import { CATEGORY_LABELS, type ContractCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trash2 } from "lucide-react";

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  start_date: string;
  end_date: string;
  amount: number | null;
  memo: string | null;
};

export function ContractDetail({ contract }: { contract: ContractRow }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("이 계약을 삭제할까요?")) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("contracts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", contract.id);
    if (error) {
      alert("삭제에 실패했습니다.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> 목록으로
      </Link>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-outline-variant/70 bg-surface-container-low/70">
          <div>
            <h1 className="text-2xl font-semibold">{contract.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {CATEGORY_LABELS[contract.category]}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm tabular-nums",
              getDdayColorClass(contract.end_date),
            )}
          >
            {getDdayLabel(contract.end_date)}
          </span>
        </CardHeader>
        <CardContent className="space-y-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/60 p-3">
              <dt className="text-xs text-muted-foreground">시작일</dt>
              <dd className="mt-1 font-medium">{contract.start_date}</dd>
            </div>
            <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/60 p-3">
              <dt className="text-xs text-muted-foreground">만료일</dt>
              <dd className="mt-1 font-medium">{contract.end_date}</dd>
            </div>
            {contract.amount != null && (
              <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/60 p-3">
                <dt className="text-xs text-muted-foreground">금액</dt>
                <dd className="mt-1 font-medium">{contract.amount.toLocaleString()}원</dd>
              </div>
            )}
            {contract.memo && (
              <div className="rounded-xl border border-outline-variant/70 bg-surface-container-low/60 p-3 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">메모</dt>
                <dd className="mt-1 whitespace-pre-wrap font-medium">{contract.memo}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href={`/dashboard/contracts/${contract.id}/edit`}>수정</Link>
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4" /> 삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
