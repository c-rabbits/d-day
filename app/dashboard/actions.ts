"use server";

import { revalidatePath } from "next/cache";
import { toUserFriendlyMessage } from "@/lib/error-messages";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server-service";

export async function softDeleteContract(contractId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const admin = createServiceRoleClient();
  const { error } = await admin
    .from("contracts")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", contractId)
    .eq("user_id", user.id);

  if (error) return { error: toUserFriendlyMessage(error.message) };
  revalidatePath("/dashboard");
  return {};
}

/** 계약 소유자인 경우에만 해당 계약의 알림을 모두 삭제 (수정 시 기존 알림 제거용, RLS DELETE 정책 없이 동작) */
export async function clearContractNotifications(contractId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const { data: contract } = await supabase
    .from("contracts")
    .select("id")
    .eq("id", contractId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!contract) return { error: "계약을 찾을 수 없거나 수정 권한이 없습니다." };

  const admin = createServiceRoleClient();
  const { error } = await admin.from("notifications").delete().eq("contract_id", contractId);
  if (error) return { error: toUserFriendlyMessage(error.message) };
  return {};
}
