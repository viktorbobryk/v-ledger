import { toNumber } from "@/lib/trades/types";

export const PAUSE_AFTER_LOSSES = 3;
export const SESSION_TIME_ZONE = "Europe/Kyiv";

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

function calendarDateInTimeZone(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

export function sessionToday(now = new Date()) {
  return (
    calendarDateInTimeZone(now, SESSION_TIME_ZONE) ??
    now.toISOString().slice(0, 10)
  );
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
  const today = sessionToday();
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

export function ticketPnlDollars(
  realizedR: number | string | null | undefined,
  riskDollars: number | null,
) {
  const parsedR = toNumber(realizedR);

  if (parsedR === null || riskDollars === null) {
    return null;
  }

  return parsedR * riskDollars;
}

export function sessionPnlDollars(
  realizedRs: Array<number | string | null | undefined>,
  riskDollars: number | null,
) {
  if (riskDollars === null) {
    return null;
  }

  return realizedRs.reduce<number>((sum, value) => {
    const pnl = ticketPnlDollars(value, riskDollars);
    return pnl === null ? sum : sum + pnl;
  }, 0);
}

export function sessionEquity(
  deposit: number | string | null | undefined,
  pnlDollars: number | null,
) {
  const parsedDeposit = Number(deposit);

  if (!Number.isFinite(parsedDeposit) || pnlDollars === null) {
    return null;
  }

  return parsedDeposit + pnlDollars;
}

export function pauseRiskDollars(riskDollars: number | null) {
  if (riskDollars === null) {
    return null;
  }

  return riskDollars * PAUSE_AFTER_LOSSES;
}

export function sessionStatus(
  consecutiveLosses: number,
  stored: SessionStatus,
): SessionStatus {
  return consecutiveLosses >= PAUSE_AFTER_LOSSES ? "pause" : stored;
}
