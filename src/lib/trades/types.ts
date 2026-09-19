export const TRADE_INSTRUMENTS = ["BTC", "ETH", "SOL"] as const;

export type TradeInstrument = (typeof TRADE_INSTRUMENTS)[number];
export type TradeSide = "long" | "short";
export type TradeStatus = "planned" | "open" | "closed" | "skipped";

export function tradeStatusFromFills(
  filledEntry: number | null,
  filledExit: number | null,
): TradeStatus {
  if (filledExit !== null) {
    return "closed";
  }

  if (filledEntry !== null) {
    return "open";
  }

  return "planned";
}

export function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function plannedStopError(
  side: TradeSide,
  entry: number | null,
  stop: number | null,
) {
  if (entry === null || stop === null) {
    return null;
  }

  if (side === "long" && stop >= entry) {
    return "For a long, stop loss must be below entry.";
  }

  if (side === "short" && stop <= entry) {
    return "For a short, stop loss must be above entry.";
  }

  return null;
}

export function stopDistance(
  entry: number | string | null | undefined,
  stop: number | string | null | undefined,
) {
  const plannedEntry = toNumber(entry);
  const plannedSl = toNumber(stop);

  if (plannedEntry === null || plannedSl === null) {
    return null;
  }

  return Math.abs(plannedEntry - plannedSl);
}

export function realizedR(trade: {
  side: TradeSide;
  planned_entry: number | string | null;
  planned_sl: number | string | null;
  filled_entry: number | string | null;
  filled_exit: number | string | null;
}) {
  const plannedEntry = toNumber(trade.planned_entry);
  const plannedSl = toNumber(trade.planned_sl);
  const filledEntry = toNumber(trade.filled_entry);
  const filledExit = toNumber(trade.filled_exit);

  if (
    plannedEntry === null ||
    plannedSl === null ||
    filledEntry === null ||
    filledExit === null
  ) {
    return null;
  }

  const risk = Math.abs(plannedEntry - plannedSl);

  if (risk === 0) {
    return null;
  }

  const pnl =
    trade.side === "long" ? filledExit - filledEntry : filledEntry - filledExit;

  return pnl / risk;
}

export type Trade = {
  id: string;
  user_id: string;
  session_id: string;
  playbook_id: string | null;
  instrument: string;
  side: TradeSide;
  status: TradeStatus;
  planned_entry: number | string | null;
  planned_sl: number | string | null;
  planned_tp: number | string | null;
  filled_entry: number | string | null;
  filled_exit: number | string | null;
  realized_r: number | string | null;
  notes: string;
  created_at: string;
  playbooks: { slug: string; name: string } | null;
};
