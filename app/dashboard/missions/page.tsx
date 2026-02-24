import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MissionList } from "@/components/mission-list";

export default async function MissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  return <MissionList />;
}
