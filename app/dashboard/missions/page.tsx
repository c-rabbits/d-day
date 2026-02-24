import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MissionList } from "@/components/mission-list";

export default async function MissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { count: contractCount } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id")
    .eq("user_id", user.id)
    .is("deleted_at", null);
  const contractIds = (contracts ?? []).map((c) => c.id);
  let hasNotification = false;
  if (contractIds.length > 0) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .in("contract_id", contractIds);
    hasNotification = (count ?? 0) > 0;
  }

  return (
    <MissionList
      contractCount={contractCount ?? 0}
      hasNotification={hasNotification}
    />
  );
}
