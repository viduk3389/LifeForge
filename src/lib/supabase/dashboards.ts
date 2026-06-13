import { createClient } from "@/lib/supabase/client";
import type { Dashboard } from "@/types/database";

export async function createDashboard(
  userId: string,
  name: string,
): Promise<Dashboard> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dashboards")
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Failed to create dashboard");
  }

  return data;
}

export async function deleteDashboard(dashboardId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("dashboards")
    .delete()
    .eq("id", dashboardId);

  if (error) {
    throw new Error(error.message);
  }
}
