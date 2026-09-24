import { createClient } from "@/lib/supabase/server";
import {
  sessionDateOf,
  sessionPnlDollars,
  sessionRiskDollars,
  type TradingSession,
} from "@/lib/sessions/defaults";

const SESSION_COLUMNS =
  "id, user_id, session_date, deposit, risk_percent, consecutive_losses, status, created_at";

export type SessionSummary = TradingSession & {
  ticket_count: number;
  pnl_dollars: number | null;
};

function toSession(row: {
  session_date: string;
  deposit: number | string;
  risk_percent: number | string;
  trades?: { realized_r: number | string | null }[] | null;
}): SessionSummary | null {
  const sessionDate = sessionDateOf(String(row.session_date));

  if (!sessionDate) {
    return null;
  }

  const trades = Array.isArray(row.trades) ? row.trades : [];
  const riskDollars = sessionRiskDollars(row.deposit, row.risk_percent);

  return {
    ...(row as TradingSession),
    session_date: sessionDate,
    ticket_count: trades.length,
    pnl_dollars: sessionPnlDollars(
      trades.map((trade) => trade.realized_r),
      riskDollars,
    ),
  };
}

export async function listSessions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(`${SESSION_COLUMNS}, trades(realized_r)`)
    .eq("user_id", userId)
    .order("session_date", { ascending: false });

  if (error) {
    return { sessions: [] as SessionSummary[], error: error.message };
  }

  const sessions = (data ?? []).flatMap((row) => {
    const session = toSession(row);
    return session ? [session] : [];
  });

  return { sessions, error: null };
}

export async function getSessionByDate(userId: string, date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .eq("user_id", userId)
    .eq("session_date", date)
    .maybeSingle();

  if (error) {
    return { session: null, error: error.message };
  }

  if (!data) {
    return { session: null, error: null };
  }

  const sessionDate = sessionDateOf(String(data.session_date));

  if (!sessionDate) {
    return { session: null, error: "Session not found." };
  }

  return {
    session: { ...data, session_date: sessionDate } as TradingSession,
    error: null,
  };
}
