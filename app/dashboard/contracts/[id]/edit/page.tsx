import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ContractEditForm } from "@/components/contract-edit-form";
import { Suspense } from "react";

async function EditContent({ id }: { id: string }) {
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
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-semibold">계약 수정</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        필요한 정보만 수정하고 저장하면 만료 알림 일정도 함께 갱신됩니다.
      </p>
      <ContractEditForm contract={contract} />
    </div>
  );
}

async function ParamsAndEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditContent id={id} />;
}

export default function ContractEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6">로딩 중…</div>}>
      <ParamsAndEdit params={params} />
    </Suspense>
  );
}
