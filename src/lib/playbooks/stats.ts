import { createClient } from "@/lib/supabase/server";
import { toNumber } from "@/lib/trades/types";

export type PlaybookStats = {
  playbookId: string;
  closed: number;
  skipped: number;
  wins: number;
  winRate: number | null;
  avgR: number | null;
};

export function emptyPlaybookStats(playbookId: string): PlaybookStats {
  return {
    playbookId,
    closed: 0,
    skipped: 0,
    wins: 0,
    winRate: null,
    avgR: null,
  };
}

export function summarizePlaybookTrades(
  playbookIds: string[],
  rows: {
    playbook_id: string | null;
    status: string;
    realized_r: number | string | null;
  }[],
) {
  const stats = new Map(
    playbookIds.map((id) => [id, emptyPlaybookStats(id)]),
  );

  for (const row of rows) {
    if (!row.playbook_id) {
      continue;
    }

    const current = stats.get(row.playbook_id);

    if (!current) {
      continue;
    }

    if (row.status === "skipped") {
      current.skipped += 1;
      continue;
    }

    if (row.status !== "closed") {
      continue;
    }

    const realized = toNumber(row.realized_r);

    if (realized === null) {
      continue;
    }

    current.closed += 1;
    current.avgR = (current.avgR ?? 0) + realized;

    if (realized > 0) {
      current.wins += 1;
    }
  }

  for (const current of stats.values()) {
    if (current.closed === 0) {
      current.avgR = null;
      current.winRate = null;
      continue;
    }

    current.avgR = current.avgR === null ? null : current.avgR / current.closed;
    current.winRate = current.wins / current.closed;
  }

  return stats;
}

export async function listPlaybookStats(userId: string, playbookIds: string[]) {
  if (playbookIds.length === 0) {
    return { stats: new Map<string, PlaybookStats>(), error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trades")
    .select("playbook_id, status, realized_r")
    .eq("user_id", userId)
    .in("status", ["closed", "skipped"]);

  if (error) {
    return { stats: new Map<string, PlaybookStats>(), error: error.message };
  }

  return {
    stats: summarizePlaybookTrades(playbookIds, data ?? []),
    error: null,
  };
}
