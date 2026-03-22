import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/xp
 * 유저의 현재 XP와 미션 완료 상태를 반환한다.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // XP 조회 (없으면 0)
  const { data: xpRow } = await supabase
    .from("user_xp")
    .select("total_xp")
    .eq("user_id", user.id)
    .single();

  const totalXp = xpRow?.total_xp ?? 0;

  // 완료된 1회성 미션 ID 목록
  const { data: onetimeRows } = await supabase
    .from("mission_completions")
    .select("mission_id")
    .eq("user_id", user.id)
    .neq("mission_id", "daily_check");

  const completedOnetime = (onetimeRows ?? []).map((r) => r.mission_id);

  // 오늘(KST) 출석체크 완료 여부
  const todayKST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  const { count } = await supabase
    .from("mission_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("mission_id", "daily_check")
    .eq("completed_date", todayKST);

  const dailyCompletedToday = (count ?? 0) > 0;

  return NextResponse.json({
    totalXp,
    completedOnetime,
    dailyCompletedToday,
  });
}
