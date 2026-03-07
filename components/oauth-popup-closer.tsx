"use client";

import { useEffect } from "react";

/**
 * 구글 로그인을 새 탭에서 연 경우, 로그인 완료 후 이 탭이 대시보드로 로드된다.
 * opener(로그인 페이지 탭)를 대시보드로 보내고 이 탭은 닫아서, 사용자는 원래 탭에서 계속 사용하게 한다.
 */
export function OAuthPopupCloser() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const opener = window.opener;
    if (!opener || opener.closed) return;
    const origin = window.location.origin;
    try {
      opener.location.href = `${origin}/dashboard`;
    } catch {
      // cross-origin 등으로 접근 불가 시 무시
    }
    window.close();
  }, []);
  return null;
}
