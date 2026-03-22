import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/leaderboard?type=all|weekly
 * 리더보드 데이터 + 내 순위 반환
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "weekly" ? "weekly" : "all";

  // 전체: 상위 100명, 주간: 상위 50명
  const limit = type === "all" ? 100 : 50;
  const { data: leaderboard } = await supabase.rpc("get_leaderboard", {
    p_type: type,
    p_limit: limit,
  });

  // 내 순위
  const { data: myRank } = await supabase.rpc("get_my_rank", {
    p_user_id: user.id,
    p_type: type,
  });

  const myRankData = myRank && myRank.length > 0 ? myRank[0] : null;

  return NextResponse.json({
    type,
    leaderboard: leaderboard ?? [],
    myRank: myRankData
      ? { rank: myRankData.rank, xp: myRankData.xp }
      : null,
  });
}
