import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ContractList } from "@/components/contract-list";
import { Suspense } from "react";

async function DashboardContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: contracts, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("end_date", { ascending: true });
  if (error) console.error("contracts fetch error", error);
  const list = contracts ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const soonCount = list.filter((c) => {
    const end = new Date(c.end_date);
    end.setHours(0, 0, 0, 0);
    const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;

  const expiredCount = list.filter((c) => {
    const end = new Date(c.end_date);
    end.setHours(0, 0, 0, 0);
    return end.getTime() < today.getTime();
  }).length;

  return (
    <div className="mx-auto w-full max-w-mobile px-4 py-7">
      <section className="mb-7 space-y-5 opacity-0 animate-fade-in-up [animation-fill-mode:forwards]">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-primary">
            DASHBOARD
          </p>
          <h1 className="mt-1 text-[1.85rem] font-bold leading-tight text-foreground">
            내 계약 현황
          </h1>
          <p className="mt-2 text-[0.95rem] text-muted-foreground">
            만료 임박 건수를 먼저 확인하고 필요한 계약을 바로 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <article className="rounded-2xl border border-outline-variant/70 bg-surface px-3.5 py-4">
            <p className="text-xs text-muted-foreground">총 계약</p>
            <p className="mt-1 text-xl font-semibold">{list.length}</p>
          </article>
          <article className="rounded-2xl border border-outline-variant/70 bg-primary-container px-3.5 py-4 text-primary-container-foreground">
            <p className="text-xs opacity-85">30일 내 만료</p>
            <p className="mt-1 text-xl font-semibold">{soonCount}</p>
          </article>
          <article className="rounded-2xl border border-outline-variant/70 bg-surface px-3.5 py-4">
            <p className="text-xs text-muted-foreground">만료 지남</p>
            <p className="mt-1 text-xl font-semibold">{expiredCount}</p>
          </article>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">계약 목록</h2>
          <span className="text-sm text-muted-foreground">{list.length}건</span>
        </div>
        <ContractList contracts={list} />
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
