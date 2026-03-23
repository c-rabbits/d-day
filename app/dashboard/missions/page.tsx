import { createClient } from "@/lib/supabase/server";
import { MissionList } from "@/components/mission-list";

/**
 * 미션 페이지. 서버에서 미션 상태를 미리 로드하여 초기 렌더링 속도 개선.
 */
export default async function MissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <MissionList />;
  }

  const { data: contracts, count: contractCount } = await supabase
    .from("contracts")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const list = contracts ?? [];
  const contractIds = list.map((c) => c.id);

  let hasNotification = false;
  if (contractIds.length > 0) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .in("contract_id", contractIds);
    hasNotification = (count ?? 0) > 0;
  }

  const { count: inviteCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id);

  return (
    <MissionList
      contractCount={contractCount ?? list.length}
      hasNotification={hasNotification}
      inviteCount={inviteCount ?? 0}
    />
  );
}
