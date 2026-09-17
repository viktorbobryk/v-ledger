"use server";

import { redirect } from "next/navigation";
import { getAuthClaims } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { PAUSE_AFTER_LOSSES } from "@/lib/sessions/defaults";
import {
  TRADE_INSTRUMENTS,
  plannedStopError,
  realizedR,
  toNumber,
  tradeStatusFromFills,
  type TradeInstrument,
  type TradeSide,
} from "@/lib/trades/types";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const raw = getString(formData, key);

  if (!raw) {
    return null;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function fail(message: string): never {
  redirect(`/?error=${encodeURIComponent(message)}`);
}

export async function createTicket(formData: FormData) {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const sessionId = getString(formData, "session_id");
  const playbookId = getString(formData, "playbook_id");
  const instrument = getString(formData, "instrument").toUpperCase();
  const side = getString(formData, "side").toLowerCase();
  const notes = getString(formData, "notes");
  const plannedEntry = getNumber(formData, "planned_entry");
  const plannedSl = getNumber(formData, "planned_sl");
  const plannedTp = getNumber(formData, "planned_tp");

  if (!sessionId || !playbookId) {
    fail("Choose a session and playbook.");
  }

  if (!TRADE_INSTRUMENTS.includes(instrument as TradeInstrument)) {
    fail("Instrument must be BTC, ETH, or SOL.");
  }

  if (side !== "long" && side !== "short") {
    fail("Side must be long or short.");
  }

  if (plannedEntry === null || plannedSl === null) {
    fail("Planned entry and stop loss are required.");
  }

  const stopError = plannedStopError(side, plannedEntry, plannedSl);

  if (stopError) {
    fail(stopError);
  }

  const supabase = await createClient();
  const userId = claims.sub;

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (sessionError || !session) {
    fail(sessionError?.message ?? "Session not found.");
  }

  const { data: playbook, error: playbookError } = await supabase
    .from("playbooks")
    .select("id")
    .eq("id", playbookId)
    .eq("user_id", userId)
    .maybeSingle();

  if (playbookError || !playbook) {
    fail(playbookError?.message ?? "Playbook not found.");
  }

  const { error } = await supabase.from("trades").insert({
    user_id: userId,
    session_id: sessionId,
    playbook_id: playbookId,
    instrument,
    side: side as TradeSide,
    status: "planned",
    planned_entry: plannedEntry,
    planned_sl: plannedSl,
    planned_tp: plannedTp,
    filled_entry: plannedEntry,
    notes,
  });

  if (error) {
    fail(error.message);
  }

  redirect("/");
}

async function requireUserId() {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  return claims.sub;
}

export async function recordFill(formData: FormData) {
  const userId = await requireUserId();
  const tradeId = getString(formData, "trade_id");
  const filledExitInput = getNumber(formData, "filled_exit");

  if (!tradeId) {
    fail("Ticket not found.");
  }

  const supabase = await createClient();
  const { data: trade, error: tradeError } = await supabase
    .from("trades")
    .select(
      "id, user_id, session_id, side, status, planned_entry, planned_sl, filled_entry, filled_exit",
    )
    .eq("id", tradeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (tradeError || !trade) {
    fail(tradeError?.message ?? "Ticket not found.");
  }

  if (trade.status === "closed" || trade.status === "skipped") {
    fail("This ticket is already finished.");
  }

  const filledEntry =
    toNumber(trade.filled_entry) ?? toNumber(trade.planned_entry);
  const filledExit =
    filledExitInput ?? toNumber(trade.filled_exit);

  if (filledEntry === null) {
    fail("Filled entry is required.");
  }

  if (trade.status === "open" && filledExit === null) {
    fail("Filled exit is required to close.");
  }

  const status = tradeStatusFromFills(filledEntry, filledExit);
  const r = realizedR({
    side: trade.side as TradeSide,
    planned_entry: trade.planned_entry,
    planned_sl: trade.planned_sl,
    filled_entry: filledEntry,
    filled_exit: filledExit,
  });

  const { error } = await supabase
    .from("trades")
    .update({
      filled_entry: filledEntry,
      filled_exit: filledExit,
      status,
      realized_r: r,
    })
    .eq("id", tradeId)
    .eq("user_id", userId);

  if (error) {
    fail(error.message);
  }

  if (trade.status !== "closed" && status === "closed") {
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("id, consecutive_losses")
      .eq("id", trade.session_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (sessionError || !session) {
      fail(sessionError?.message ?? "Session not found.");
    }

    const consecutiveLosses =
      r !== null && r < 0 ? session.consecutive_losses + 1 : 0;
    const sessionStatus =
      consecutiveLosses >= PAUSE_AFTER_LOSSES ? "pause" : "trade";

    const { error: updateSessionError } = await supabase
      .from("sessions")
      .update({
        consecutive_losses: consecutiveLosses,
        status: sessionStatus,
      })
      .eq("id", session.id)
      .eq("user_id", userId);

    if (updateSessionError) {
      fail(updateSessionError.message);
    }
  }

  redirect("/");
}

export async function skipTicket(formData: FormData) {
  const userId = await requireUserId();
  const tradeId = getString(formData, "trade_id");

  if (!tradeId) {
    fail("Ticket not found.");
  }

  const supabase = await createClient();
  const { data: trade, error: tradeError } = await supabase
    .from("trades")
    .select("id, status")
    .eq("id", tradeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (tradeError || !trade) {
    fail(tradeError?.message ?? "Ticket not found.");
  }

  if (trade.status !== "planned") {
    fail("Only a planned ticket can be skipped.");
  }

  const { error } = await supabase
    .from("trades")
    .update({
      status: "skipped",
      filled_entry: null,
      filled_exit: null,
      realized_r: null,
    })
    .eq("id", tradeId)
    .eq("user_id", userId);

  if (error) {
    fail(error.message);
  }

  redirect("/");
}
