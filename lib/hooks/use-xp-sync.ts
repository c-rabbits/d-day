"use client";

import { useEffect, useRef } from "react";
import { syncFromServer } from "@/lib/xp-store";

let synced = false;

/**
 * 앱 마운트 시 1회 DB → localStorage 동기화.
 * 여러 컴포넌트에서 호출해도 1번만 실행됨.
 */
export function useXpSync() {
  const called = useRef(false);

  useEffect(() => {
    if (synced || called.current) return;
    called.current = true;
    synced = true;
    syncFromServer();
  }, []);
}
