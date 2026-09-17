"use server";

import { redirect } from "next/navigation";
import { getAuthClaims } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  TRADE_INSTRUMENTS,
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
  const filledEntry = getNumber(formData, "filled_entry");
  const filledExit = getNumber(formData, "filled_exit");

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

  if (filledExit !== null && filledEntry === null) {
    fail("Filled exit needs a filled entry.");
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
    status: tradeStatusFromFills(filledEntry, filledExit),
    planned_entry: plannedEntry,
    planned_sl: plannedSl,
    planned_tp: plannedTp,
    filled_entry: filledEntry,
    filled_exit: filledExit,
    notes,
  });

  if (error) {
    fail(error.message);
  }

  redirect("/");
}
