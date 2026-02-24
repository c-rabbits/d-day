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
