import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SESSION,
  sessionToday,
  type TradingSession,
} from "@/lib/sessions/defaults";

const SESSION_COLUMNS =
  "id, user_id, session_date, deposit, risk_percent, consecutive_losses, status, created_at";

export async function ensureTodaySession(userId: string) {
  const supabase = await createClient();
  const sessionDate = sessionToday();

  const { data: latest, error: latestError } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .eq("user_id", userId)
    .order("session_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    return { session: null, error: latestError.message };
  }

  if (latest && latest.session_date === sessionDate) {
    return { session: latest as TradingSession, error: null };
  }

  const { error: seedError } = await supabase.from("sessions").upsert(
    {
      user_id: userId,
      session_date: sessionDate,
      deposit: latest?.deposit ?? DEFAULT_SESSION.deposit,
      risk_percent: latest?.risk_percent ?? DEFAULT_SESSION.risk_percent,
      consecutive_losses: DEFAULT_SESSION.consecutive_losses,
      status: DEFAULT_SESSION.status,
    },
    { onConflict: "user_id,session_date", ignoreDuplicates: true },
  );

  if (seedError) {
    return { session: null, error: seedError.message };
  }

  const { data, error } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .eq("user_id", userId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  if (error) {
    return { session: null, error: error.message };
  }

  return { session: data as TradingSession | null, error: null };
}
