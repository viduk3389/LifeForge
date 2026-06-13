import { redirect } from "next/navigation";

import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { getDashboardsForUser } from "@/lib/supabase/dashboards.server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dashboards = await getDashboardsForUser(user.id);

  return <DashboardGrid dashboards={dashboards} userId={user.id} />;
}
