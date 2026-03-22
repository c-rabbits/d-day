"use client";

import { useEffect } from "react";

/**
 * 구글 OAuth 리다이렉트 후 뷰포트가 줌아웃되는 문제를 보정.
 * 마운트 시 뷰포트 메타를 강제 재설정하고, visual viewport 변화를 감지해 줌을 1로 복원한다.
 */
export function ViewportFix() {
  useEffect(() => {
    const content =
      "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover";

    // 1) 메타 태그 강제 재설정
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="viewport"]',
    );
    if (meta) {
      meta.setAttribute("content", content);
    }

    // 2) visual viewport scale 이 1 미만이면 강제 복원
    const vv = window.visualViewport;
    if (vv && vv.scale < 1) {
      // 메타 태그를 잠깐 제거 후 다시 삽입하면 브라우저가 뷰포트를 재계산한다
      if (meta) {
        meta.remove();
        const fresh = document.createElement("meta");
        fresh.name = "viewport";
        fresh.content = content;
        document.head.appendChild(fresh);
      }
    }

    // 3) resize 이벤트에서도 줌 감지 후 복원
    function onResize() {
      if (window.visualViewport && window.visualViewport.scale < 0.99) {
        const m = document.querySelector<HTMLMetaElement>(
          'meta[name="viewport"]',
        );
        if (m) m.setAttribute("content", content);
      }
    }

    vv?.addEventListener("resize", onResize);
    return () => {
      vv?.removeEventListener("resize", onResize);
    };
  }, []);

  return null;
}
