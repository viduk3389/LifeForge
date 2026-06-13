import { createClient } from "@/lib/supabase/server";
import type { Dashboard } from "@/types/database";

export async function getDashboardsForUser(userId: string): Promise<Dashboard[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("dashboards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
