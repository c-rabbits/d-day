import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ContractDetail } from "@/components/contract-detail";
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
  return <ContractDetail contract={contract} />;
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
    <Suspense fallback={<div className="p-6">로딩 중…</div>}>
      <ParamsAndDetail params={params} />
    </Suspense>
  );
}
