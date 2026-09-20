"use server";

import { redirect } from "next/navigation";
import { getAuthClaims } from "@/lib/auth/session";
import { deskHref, sessionRiskError, utcToday } from "@/lib/sessions/defaults";
import { createClient } from "@/lib/supabase/server";

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

function fail(message: string, sessionDate?: string | null): never {
  redirect(deskHref({ date: sessionDate, error: message }));
}

export async function updateSessionRisk(formData: FormData) {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const sessionId = getString(formData, "session_id");
  const deposit = getNumber(formData, "deposit");
  const riskPercent = getNumber(formData, "risk_percent");

  if (!sessionId) {
    fail("Session not found.");
  }

  const riskError = sessionRiskError(deposit, riskPercent);

  if (riskError || deposit === null || riskPercent === null) {
    fail(riskError ?? "Invalid risk.");
  }

  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("id, session_date")
    .eq("id", sessionId)
    .eq("user_id", claims.sub)
    .maybeSingle();

  if (sessionError || !session) {
    fail(sessionError?.message ?? "Session not found.");
  }

  if (String(session.session_date).slice(0, 10) !== utcToday()) {
    fail("Risk can only be changed on today's session.", session.session_date);
  }

  const { data, error } = await supabase
    .from("sessions")
    .update({
      deposit,
      risk_percent: riskPercent,
    })
    .eq("id", sessionId)
    .eq("user_id", claims.sub)
    .select("id")
    .maybeSingle();

  if (error) {
    fail(error.message);
  }

  if (!data) {
    fail("Session not found.");
  }

  redirect("/");
}
