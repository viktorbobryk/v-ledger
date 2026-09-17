"use server";

import { redirect } from "next/navigation";
import { getAuthClaims } from "@/lib/auth/session";
import { sessionRiskError } from "@/lib/sessions/defaults";
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

function fail(message: string): never {
  redirect(`/?error=${encodeURIComponent(message)}`);
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
