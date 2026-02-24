"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toUserFriendlyMessage } from "@/lib/error-messages";
import { Button } from "@/components/ui/button";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

/**
 * 대시보드 등에서 사용. 알림 권한 요청 후 FCM 토큰을 push_tokens에 저장.
 * Firebase 설정 전에는 버튼만 보이고, 설정 후에는 실제 토큰 저장까지 동작.
 */
export function PushEnable() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const hasFirebase =
    typeof window !== "undefined" &&
    !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    );

  const handleEnable = async () => {
    if (!hasFirebase) {
      setMessage("Firebase 설정이 필요합니다. docs/FCM_SETUP.md를 참고하세요.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("알림이 허용되지 않았습니다.");
        setStatus("error");
        return;
      }
      const token = await getFcmToken();
      if (!token) {
        setMessage("FCM 토큰 실패. 1) npm run generate:firebase-sw 2) 서버 재시작 3) F12 콘솔 에러 확인");
        setStatus("error");
        return;
      }
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setStatus("error");
        setMessage("로그인이 필요합니다.");
        return;
      }
      await supabase.from("push_tokens").upsert(
        { user_id: user.id, token },
        { onConflict: "user_id,token" },
      );
      setStatus("ok");
      setMessage("알림이 활성화되었습니다.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? toUserFriendlyMessage(e.message) : "설정에 실패했습니다.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleEnable}
        disabled={status === "loading"}
      >
        <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
        {status === "loading" ? "설정 중…" : status === "ok" ? "알림 켜짐" : "알림 켜기"}
      </Button>
      {message && (
        <span
          className={
            status === "error"
              ? "hidden text-xs text-destructive sm:inline"
              : "hidden text-xs text-muted-foreground sm:inline"
          }
        >
          {message}
        </span>
      )}
    </div>
  );
}

/** Firebase가 설정된 경우에만 FCM 토큰 반환. 실패 시 null + 콘솔에 에러 출력 */
async function getFcmToken(): Promise<string | null> {
  try {
    const { getFirebaseApp } = await import("@/lib/firebase");
    const app = await getFirebaseApp();
    if (!app) {
      console.warn("[FCM] Firebase 앱 초기화 실패. .env.local 의 NEXT_PUBLIC_FIREBASE_* 확인 후 서버 재시작.");
      return null;
    }
    const vapid = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapid) {
      console.warn("[FCM] VAPID 키 없음. NEXT_PUBLIC_FIREBASE_VAPID_KEY 확인.");
      return null;
    }
    const { getMessaging, getToken } = await import("firebase/messaging");
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: vapid });
    return token ?? null;
  } catch (e) {
    console.error("[FCM] getToken 실패:", e);
    return null;
  }
}
