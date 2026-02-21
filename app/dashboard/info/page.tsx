import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InfoBannerList } from "@/components/info-banner-list";

export default async function DashboardInfoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  return <InfoBannerList />;
}
