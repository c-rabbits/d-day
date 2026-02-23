import { createClient } from "@supabase/supabase-js";

/**
 * 서버 전용 Supabase 클라이언트 (service_role 키 사용, RLS 우회).
 * 삭제 등 서버 액션에서 쿠키 세션이 RLS에 반영되지 않을 때만 사용하고,
 * 반드시 요청 사용자 검증(예: cookie 클라이언트로 getUser()) 후 본인 데이터에만 사용할 것.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY (and URL) required for server admin client");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
