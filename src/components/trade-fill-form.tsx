import { recordFill, skipTicket } from "@/app/actions/trades";
import type { Trade } from "@/lib/trades/types";

const fieldClassName =
  "w-28 rounded-md border border-line bg-ink px-2 py-1.5 text-sm text-mist outline-none placeholder:text-fog/70 focus:border-gold focus:ring-2 focus:ring-gold/30";

export function TradeFillForm({ trade }: { trade: Trade }) {
  if (trade.status === "closed" || trade.status === "skipped") {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <form action={recordFill} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="trade_id" value={trade.id} />
        <label className="text-xs text-fog">
          Filled exit
          <input
            name="filled_exit"
            type="number"
            step="any"
            inputMode="decimal"
            required={trade.status === "open"}
            placeholder={trade.status === "open" ? undefined : "Optional"}
            className={`mt-1 block ${fieldClassName}`}
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-gold px-3 py-1.5 text-sm font-medium text-ink hover:bg-gold/90"
        >
          {trade.status === "open" ? "Close" : "Record fill"}
        </button>
      </form>
      {trade.status === "planned" ? (
        <form action={skipTicket}>
          <input type="hidden" name="trade_id" value={trade.id} />
          <button
            type="submit"
            className="rounded-md border border-line px-3 py-1.5 text-sm text-mist hover:border-gold hover:text-gold"
          >
            Skip
          </button>
        </form>
      ) : null}
    </div>
  );
}
