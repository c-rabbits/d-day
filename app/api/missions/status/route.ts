import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * 미션 조건 판별용 (계약 수, 알림 설정 여부).
 * 미션 페이지에서만 클라이언트가 호출하므로, 서버 페이지는 DB 조회 없이 캐시 가능.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: contracts, count: contractCount } = await supabase
    .from("contracts")
    .select("id", { count: "exact" })
    .eq("user_id", user.id)
    .is("deleted_at", null);

  const list = contracts ?? [];
  const contractIds = list.map((c) => c.id);
  const resolvedCount = contractCount ?? list.length;

  let hasNotification = false;
  if (contractIds.length > 0) {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .in("contract_id", contractIds);
    hasNotification = (count ?? 0) > 0;
  }

  return NextResponse.json({
    contractCount: resolvedCount,
    hasNotification,
  });
}
