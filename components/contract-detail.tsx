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
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="h-4 w-4" /> 목록으로
      </Link>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{contract.title}</h1>
            <p className="text-muted-foreground text-sm">
              {CATEGORY_LABELS[contract.category]}
            </p>
          </div>
          <span className={cn("text-lg tabular-nums", getDdayColorClass(contract.end_date))}>
            {getDdayLabel(contract.end_date)}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-muted-foreground">시작일</dt>
              <dd>{contract.start_date}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">만료일</dt>
              <dd>{contract.end_date}</dd>
            </div>
            {contract.amount != null && (
              <div>
                <dt className="text-muted-foreground">금액</dt>
                <dd>{contract.amount.toLocaleString()}원</dd>
              </div>
            )}
            {contract.memo && (
              <div>
                <dt className="text-muted-foreground">메모</dt>
                <dd className="whitespace-pre-wrap">{contract.memo}</dd>
              </div>
            )}
          </dl>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" asChild size="sm">
              <Link href={`/dashboard/contracts/${contract.id}/edit`}>수정</Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> 삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
