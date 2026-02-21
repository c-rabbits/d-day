import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard-home";
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

  return <DashboardHome contracts={list} soonCount={soonCount} expiredCount={expiredCount} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6">로딩 중…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
