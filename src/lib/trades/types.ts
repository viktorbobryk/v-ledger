export type TradeSide = "long" | "short";
export type TradeStatus = "planned" | "open" | "closed" | "skipped";

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
