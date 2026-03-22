import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { MISSIONS } from "@/lib/mission";

/**
 * POST /api/missions/complete
 * 미션 완료 + XP 부여 (서버 검증)
 * Body: { missionId: string }
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
  const missionId = body?.missionId as string | undefined;

  // 미션 유효성 확인
  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission) {
    return NextResponse.json({ error: "Invalid mission" }, { status: 400 });
  }

  const todayKST = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });

  // 중복 완료 체크
  if (mission.type === "daily") {
    const { count } = await supabase
      .from("mission_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("mission_id", mission.id)
      .eq("completed_date", todayKST);
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: "Already completed today" }, { status: 409 });
    }
  } else {
    const { count } = await supabase
      .from("mission_completions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("mission_id", mission.id);
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: "Already completed" }, { status: 409 });
    }
  }

  // 1회성 미션 조건 검증
  if (mission.type === "one_time") {
    const { data: contracts, count: contractCount } = await supabase
      .from("contracts")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null);

    const resolvedCount = contractCount ?? (contracts ?? []).length;
    const contractIds = (contracts ?? []).map((c) => c.id);

    if (mission.id === "first_contract" && resolvedCount < 1) {
      return NextResponse.json({ error: "Condition not met" }, { status: 400 });
    }
    if (mission.id === "three_contracts" && resolvedCount < 3) {
      return NextResponse.json({ error: "Condition not met" }, { status: 400 });
    }
    if (mission.id === "set_notification") {
      let hasNotification = false;
      if (contractIds.length > 0) {
        const { count } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .in("contract_id", contractIds);
        hasNotification = (count ?? 0) > 0;
      }
      if (!hasNotification) {
        return NextResponse.json({ error: "Condition not met" }, { status: 400 });
      }
    }

    // 초대 미션 조건 검증
    const inviteMatch = mission.id.match(/^invite_(\d+)$/);
    if (inviteMatch) {
      const requiredInvites = parseInt(inviteMatch[1], 10);
      const { count: inviteCount } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user.id);
      if ((inviteCount ?? 0) < requiredInvites) {
        return NextResponse.json({ error: "Condition not met" }, { status: 400 });
      }
    }
  }

  // 미션 완료 기록 삽입
  const { error: insertError } = await supabase.from("mission_completions").insert({
    user_id: user.id,
    mission_id: mission.id,
    completed_date: todayKST,
    xp_awarded: mission.xpReward,
  });

  if (insertError) {
    return NextResponse.json({ error: "Failed to complete mission" }, { status: 500 });
  }

  // XP 부여 (원자적 RPC)
  const { data: newXp, error: xpError } = await supabase.rpc("add_user_xp", {
    p_user_id: user.id,
    p_delta: mission.xpReward,
  });

  if (xpError) {
    return NextResponse.json({ error: "Failed to add XP" }, { status: 500 });
  }

  // 뱃지 자동 해금 체크
  const { data: newBadges } = await supabase.rpc("check_and_unlock_badges", {
    p_user_id: user.id,
  });

  return NextResponse.json({
    success: true,
    totalXp: newXp,
    missionId: mission.id,
    xpAwarded: mission.xpReward,
    newBadges: newBadges ?? [],
  });
}
