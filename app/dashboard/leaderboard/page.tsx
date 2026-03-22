import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LeaderboardView } from "@/components/leaderboard-view";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return <LeaderboardView />;
}
