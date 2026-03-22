import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CODE: "유효하지 않은 추천 코드입니다.",
  SELF_REFERRAL: "자신의 추천 코드는 사용할 수 없습니다.",
  ALREADY_REFERRED: "이미 추천 코드를 사용했습니다.",
  REFERRER_LIMIT: "이 추천 코드의 초대 횟수가 초과되었습니다.",
};

/**
 * GET /api/referral
 * 내 추천 코드 + 초대 현황 조회
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 내 추천 코드
  const { data: xpRow } = await supabase
    .from("user_xp")
    .select("referral_code")
    .eq("user_id", user.id)
    .single();

  // 초대한 사람 수
  const { count } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id);

  // 이미 추천 받았는지
  const { count: referredCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referred_id", user.id);

  return NextResponse.json({
    referralCode: xpRow?.referral_code ?? null,
    inviteCount: count ?? 0,
    maxInvites: 30,
    alreadyReferred: (referredCount ?? 0) > 0,
  });
}

/**
 * POST /api/referral
 * 추천 코드 입력 처리
 * Body: { code: string }
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
  const code = (body?.code as string)?.trim()?.toUpperCase();

  if (!code || code.length < 4) {
    return NextResponse.json({ error: "추천 코드를 입력해주세요." }, { status: 400 });
  }

  // user_xp 행이 없으면 먼저 생성 (추천 코드 자동 부여)
  await supabase.rpc("add_user_xp", { p_user_id: user.id, p_delta: 0 });

  // 추천 처리 (DB 함수)
  const { data, error } = await supabase.rpc("process_referral", {
    p_referred_id: user.id,
    p_referral_code: code,
  });

  if (error) {
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  const result = data as { success: boolean; error?: string };

  if (!result.success) {
    const message = ERROR_MESSAGES[result.error ?? ""] ?? "알 수 없는 오류입니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
