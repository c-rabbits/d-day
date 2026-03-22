import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/badges
 * 유저의 해금된 뱃지 목록 반환
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 뱃지 체크 (새로 해금된 것 있으면 자동 INSERT)
  await supabase.rpc("check_and_unlock_badges", { p_user_id: user.id });

  // 해금된 뱃지 목록 조회
  const { data: badges } = await supabase
    .from("user_badges")
    .select("badge_id, unlocked_at")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: true });

  const res = NextResponse.json({
    badges: badges ?? [],
  });
  res.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
  return res;
}
