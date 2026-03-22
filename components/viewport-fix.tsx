"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * OAuth 리다이렉트 후 모바일 브라우저에서 줌아웃되는 문제를 해결.
 * 콜백에서 ?from=oauth 파라미터와 함께 돌아오면 한 번 강제 새로고침하여
 * 브라우저 뷰포트를 초기화한다.
 */
export function ViewportFix() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("from") !== "oauth") return;

    // 무한 새로고침 방지: sessionStorage 플래그
    const key = "__viewport_reloaded";
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      // URL에서 ?from=oauth 제거 (히스토리 깔끔하게)
      const url = new URL(window.location.href);
      url.searchParams.delete("from");
      window.history.replaceState(null, "", url.pathname + url.search);
      return;
    }

    sessionStorage.setItem(key, "1");
    // 강제 새로고침 — 브라우저 뷰포트 줌 상태 초기화
    window.location.reload();
  }, [searchParams]);

  return null;
}
