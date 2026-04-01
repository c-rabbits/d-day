// 머니게임 — 매일 scheduled_date가 오늘인 알림을 찾아 FCM 푸시 발송 (HTTP v1 API)
// Cron으로 매일 호출. FCM_SERVICE_ACCOUNT_JSON 시크릿 필요 (Legacy 서버 키 사용 중지됨).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT, importPKCS8 } from "npm:jose@5.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

async function getFcmAccessToken(sa: ServiceAccount): Promise<string> {
  const key = await importPKCS8(sa.private_key.replace(/\\n/g, "\n"), "RS256");
  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`OAuth token failed: ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

/** FCM 발송 결과 */
type FcmResult = { ok: true } | { ok: false; unregistered: boolean; error: string };

async function sendFcmV1(
  projectId: string,
  accessToken: string,
  fcmToken: string,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<FcmResult> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: { title, body },
          data,
        },
      }),
    }
  );
  if (res.ok) return { ok: true };
  const errText = await res.text().catch(() => "");
  // 404 또는 UNREGISTERED → 토큰 만료/무효
  const unregistered = res.status === 404 || errText.includes("UNREGISTERED");
  return { ok: false, unregistered, error: errText };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const saJson = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON");

    if (!saJson) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "FCM_SERVICE_ACCOUNT_JSON secret not set. Firebase 서비스 계정 JSON을 설정하세요.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sa: ServiceAccount;
    try {
      sa = JSON.parse(saJson) as ServiceAccount;
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid FCM_SERVICE_ACCOUNT_JSON" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().slice(0, 10);

    const { data: notifications } = await supabase
      .from("notifications")
      .select("id, contract_id, notify_days_before")
      .eq("scheduled_date", today)
      .eq("is_sent", false);

    if (!notifications?.length) {
      return new Response(
        JSON.stringify({ ok: true, sent: 0, message: "오늘 발송할 알림 없음" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contractIds = [...new Set(notifications.map((n) => n.contract_id))];
    const { data: contracts } = await supabase
      .from("contracts")
      .select("id, user_id, title")
      .in("id", contractIds);

    const contractMap = new Map((contracts ?? []).map((c) => [c.id, c]));
    const accessToken = await getFcmAccessToken(sa);
    let sent = 0;
    let failed = 0;
    const staleTokens: string[] = []; // 무효 토큰 수집

    for (const notif of notifications) {
      const contract = contractMap.get(notif.contract_id);
      if (!contract) continue;

      const { data: tokens } = await supabase
        .from("push_tokens")
        .select("token")
        .eq("user_id", contract.user_id);

      // 토큰이 없으면 발송할 수 없으므로 완료 처리
      if (!tokens?.length) {
        await supabase.from("notifications").update({ is_sent: true }).eq("id", notif.id);
        continue;
      }

      const title = "머니게임 알림";
      const body =
        notif.notify_days_before === 1
          ? `내일 [${contract.title}]이(가) 만료됩니다.`
          : `${notif.notify_days_before}일 후 [${contract.title}] 계약이 만료됩니다.`;

      let anySent = false;
      for (const { token } of tokens) {
        const result = await sendFcmV1(sa.project_id, accessToken, token, title, body, {
          contract_id: contract.id,
        });
        if (result.ok) {
          sent++;
          anySent = true;
        } else {
          console.error(`[FCM] 발송 실패 token=${token.slice(0, 12)}… error=${result.error}`);
          // 무효/만료 토큰이면 삭제 대상에 추가
          if (result.unregistered) {
            staleTokens.push(token);
          } else {
            failed++;
          }
        }
      }

      // 최소 1건 성공 또는 모든 토큰이 무효 → 완료 처리
      // 전부 일시적 실패면 is_sent = false 유지 → 다음날 재시도
      if (anySent || staleTokens.length > 0) {
        await supabase.from("notifications").update({ is_sent: true }).eq("id", notif.id);
      }
    }

    // 무효 토큰 일괄 삭제
    if (staleTokens.length > 0) {
      await supabase.from("push_tokens").delete().in("token", staleTokens);
      console.log(`[FCM] 무효 토큰 ${staleTokens.length}개 삭제`);
    }

    return new Response(
      JSON.stringify({ ok: true, sent, failed, staleTokensRemoved: staleTokens.length, total: notifications.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
