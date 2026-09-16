import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SESSION,
  utcToday,
  type TradingSession,
} from "@/lib/sessions/defaults";

export async function ensureTodaySession(userId: string) {
  const supabase = await createClient();
  const sessionDate = utcToday();

  const { error: seedError } = await supabase.from("sessions").upsert(
    {
      user_id: userId,
      session_date: sessionDate,
      ...DEFAULT_SESSION,
    },
    { onConflict: "user_id,session_date", ignoreDuplicates: true },
  );

  if (seedError) {
    return { session: null, error: seedError.message };
  }

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, user_id, session_date, deposit, risk_percent, consecutive_losses, status, created_at",
    )
    .eq("user_id", userId)
    .eq("session_date", sessionDate)
    .maybeSingle();

  if (error) {
    return { session: null, error: error.message };
  }

  return { session: data as TradingSession | null, error: null };
}
