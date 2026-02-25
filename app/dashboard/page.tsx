import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardHome } from "@/components/dashboard-home";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Suspense } from "react";
import { getDdayForPaymentDay, isSubscriptionContract } from "@/lib/dday";
import { parsePaymentDayFromMemo } from "@/lib/contract-memo";

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

  const subscriptionList = list.filter((c) => isSubscriptionContract(c.end_date));
  const longtermList = list.filter((c) => !isSubscriptionContract(c.end_date));

  const subscriptionTotal = subscriptionList.length;
  const subscriptionAmountSum = subscriptionList.reduce((sum, c) => sum + (c.amount ?? 0), 0);
  const longtermAmountSum = longtermList.reduce((sum, c) => sum + (c.amount ?? 0), 0);

  const subscriptionSoon7 = subscriptionList.filter((c) => {
    const day = parsePaymentDayFromMemo(c.memo);
    if (day == null) return false;
    const d = getDdayForPaymentDay(day);
    return d >= 0 && d <= 7;
  }).length;
  const subscriptionSoon1 = subscriptionList.filter((c) => {
    const day = parsePaymentDayFromMemo(c.memo);
    if (day == null) return false;
    const d = getDdayForPaymentDay(day);
    return d >= 0 && d <= 1;
  }).length;

  const longtermTotal = longtermList.length;
  const longtermSoon30 = longtermList.filter((c) => {
    const end = new Date(c.end_date);
    end.setHours(0, 0, 0, 0);
    const days = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  }).length;
  const longtermExpired = longtermList.filter((c) => {
    const end = new Date(c.end_date);
    end.setHours(0, 0, 0, 0);
    return end.getTime() < today.getTime();
  }).length;

  return (
    <DashboardHome
      contracts={list}
      subscriptionTotal={subscriptionTotal}
      subscriptionSoon7={subscriptionSoon7}
      subscriptionSoon1={subscriptionSoon1}
      subscriptionAmountSum={subscriptionAmountSum}
      longtermTotal={longtermTotal}
      longtermSoon30={longtermSoon30}
      longtermExpired={longtermExpired}
      longtermAmountSum={longtermAmountSum}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}
