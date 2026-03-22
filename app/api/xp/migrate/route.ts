import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * POST /api/xp/migrate
 * localStorage -> DB 일회성 마이그레이션
 * Body: { totalXp: number, completedOnetime: string[] }
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { totalXp, completedOnetime } = body as {
    totalXp: number;
    completedOnetime: string[];
  };

  // 이미 DB에 데이터가 있으면 마이그레이션 건너뛰기
  const { data: existingXp } = await supabase
    .from("user_xp")
    .select("total_xp")
    .eq("user_id", user.id)
    .single();

  if (existingXp && existingXp.total_xp > 0) {
    return NextResponse.json({ skipped: true, reason: "DB data already exists" });
  }

  const { count: existingMissions } = await supabase
    .from("mission_completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((existingMissions ?? 0) > 0) {
    return NextResponse.json({ skipped: true, reason: "DB data already exists" });
  }

  // XP 마이그레이션
  if (totalXp > 0) {
    const clampedXp = Math.min(Math.max(0, Math.floor(totalXp)), 999999);
    await supabase.rpc("add_user_xp", {
      p_user_id: user.id,
      p_delta: clampedXp,
    });
  }

  // 1회성 미션 완료 기록 마이그레이션
  const todayKST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  if (Array.isArray(completedOnetime) && completedOnetime.length > 0) {
    const rows = completedOnetime.map((missionId) => ({
      user_id: user.id,
      mission_id: missionId,
      completed_date: todayKST,
      xp_awarded: 0, // XP는 이미 totalXp에 포함됨
    }));
    await supabase.from("mission_completions").insert(rows);
  }

  return NextResponse.json({ success: true });
}
