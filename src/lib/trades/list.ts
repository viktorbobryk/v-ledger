import { createClient } from "@/lib/supabase/server";
import type { Trade } from "@/lib/trades/types";

export async function listSessionTrades(sessionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trades")
    .select(
      "id, user_id, session_id, playbook_id, instrument, side, status, planned_entry, planned_sl, planned_tp, filled_entry, filled_exit, realized_r, notes, created_at, playbooks(slug, name)",
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    return { trades: [] as Trade[], error: error.message };
  }

  const trades = (data ?? []).map((row) => {
    const playbook = Array.isArray(row.playbooks)
      ? (row.playbooks[0] ?? null)
      : row.playbooks;

    return { ...row, playbooks: playbook } as Trade;
  });

  return { trades, error: null };
}
