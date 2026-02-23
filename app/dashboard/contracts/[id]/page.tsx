import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ContractDetail } from "@/components/contract-detail";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Suspense } from "react";

async function ContractContent({ id }: { id: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (error || !contract) notFound();

  const { data: notifs } = await supabase
    .from("notifications")
    .select("notify_days_before")
    .eq("contract_id", id);
  const notifyDays = [...new Set((notifs ?? []).map((n) => n.notify_days_before as number))].sort(
    (a, b) => b - a,
  );

  return <ContractDetail contract={contract} notifyDays={notifyDays} />;
}

async function ParamsAndDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContractContent id={id} />;
}

export default function ContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ParamsAndDetail params={params} />
    </Suspense>
  );
}
