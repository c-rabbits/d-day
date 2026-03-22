import { createClient } from "@/lib/supabase/server";
import { ProfileOverview } from "@/components/profile-overview";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // middleware에서 이미 인증 확인됨, user는 항상 존재
  return <ProfileOverview email={user?.email ?? ""} createdAt={user?.created_at ?? null} />;
}
