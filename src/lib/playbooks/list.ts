import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_PLAYBOOKS,
  type Playbook,
} from "@/lib/playbooks/defaults";

export async function listPlaybooks(userId: string) {
  const supabase = await createClient();

  const seed = DEFAULT_PLAYBOOKS.map((playbook) => ({
    ...playbook,
    user_id: userId,
  }));

  const { error: seedError } = await supabase
    .from("playbooks")
    .upsert(seed, { onConflict: "user_id,slug", ignoreDuplicates: true });

  if (seedError) {
    return { playbooks: [] as Playbook[], error: seedError.message };
  }

  const { data, error } = await supabase
    .from("playbooks")
    .select("id, user_id, slug, name, description, sort_order, created_at")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) {
    return { playbooks: [] as Playbook[], error: error.message };
  }

  return { playbooks: (data ?? []) as Playbook[], error: null };
}
