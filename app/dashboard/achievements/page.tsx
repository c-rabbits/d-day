import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BadgeCollection } from "@/components/badge-collection";

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return <BadgeCollection />;
}
