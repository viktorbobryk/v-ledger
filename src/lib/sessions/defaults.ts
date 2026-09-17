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

export function sessionStatus(
  consecutiveLosses: number,
  stored: SessionStatus,
): SessionStatus {
  return consecutiveLosses >= PAUSE_AFTER_LOSSES ? "pause" : stored;
}
