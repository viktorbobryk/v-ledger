export const PAUSE_AFTER_LOSSES = 3;

export const DEFAULT_SESSION = {
  deposit: 200,
  risk_percent: 2,
  consecutive_losses: 0,
  status: "trade",
} as const;

export type SessionStatus = "trade" | "pause";

export type TradingSession = {
  id: string;
  user_id: string;
  session_date: string;
  deposit: number | string;
  risk_percent: number | string;
  consecutive_losses: number;
  status: SessionStatus;
  created_at: string;
};

export function utcToday() {
  return new Date().toISOString().slice(0, 10);
}

const SESSION_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function sessionDateOf(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = value.slice(0, 10);
  return SESSION_DATE.test(date) ? date : null;
}

export function parseSessionDate(value: string | undefined) {
  if (!value || !SESSION_DATE.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));

  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }

  return value;
}

export function deskHref(options?: { date?: string | null; error?: string }) {
  const date = sessionDateOf(options?.date ?? undefined);
  const today = utcToday();
  const params = new URLSearchParams();

  if (options?.error) {
    params.set("error", options.error);
  }

  const query = params.toString();
  const suffix = query ? `?${query}` : "";

  if (date && date !== today) {
    return `/history/${date}${suffix}`;
  }

  return `/${suffix}`;
}

export function sessionRiskError(
  deposit: number | null,
  riskPercent: number | null,
) {
  if (deposit === null || deposit <= 0) {
    return "Deposit must be greater than 0.";
  }

  if (riskPercent === null || riskPercent <= 0) {
    return "Risk must be greater than 0.";
  }

  if (riskPercent > 100) {
    return "Risk cannot exceed 100%.";
  }

  return null;
}

export function sessionRiskDollars(
  deposit: number | string | null | undefined,
  riskPercent: number | string | null | undefined,
) {
  const parsedDeposit = Number(deposit);
  const parsedRisk = Number(riskPercent);

  if (
    !Number.isFinite(parsedDeposit) ||
    !Number.isFinite(parsedRisk) ||
    parsedDeposit <= 0 ||
    parsedRisk <= 0
  ) {
    return null;
  }

  return (parsedDeposit * parsedRisk) / 100;
}

export function sessionStatus(
  consecutiveLosses: number,
  stored: SessionStatus,
): SessionStatus {
  return consecutiveLosses >= PAUSE_AFTER_LOSSES ? "pause" : stored;
}
