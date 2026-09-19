import { Fragment } from "react";
import { TicketRiskReadout } from "@/components/ticket-risk-readout";
import { TradeFillForm } from "@/components/trade-fill-form";
import { stopDistance, toNumber, type Trade } from "@/lib/trades/types";

function filledEntryDisplay(trade: Trade) {
  if (trade.status === "skipped") {
    return null;
  }

  return trade.filled_entry ?? trade.planned_entry;
}

function formatPrice(value: number | string | null) {
  if (value === null) {
    return "—";
  }

  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function formatNotes(notes: string) {
  const trimmed = notes.trim();
  return trimmed === "" ? null : trimmed;
}

function formatR(value: number | string | null) {
  const parsed = toNumber(value);

  if (parsed === null) {
    return "—";
  }

  const sign = parsed > 0 ? "+" : "";
  return `${sign}${parsed.toFixed(2)}R`;
}

export function TradesList({
  trades,
  riskDollars,
}: {
  trades: Trade[];
  riskDollars: number | null;
}) {
  if (trades.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-fog">
        No tickets in this session.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[64rem] text-left text-sm">
        <thead className="border-b border-line bg-paper text-fog">
          <tr>
            <th className="px-4 py-3 font-medium">Playbook</th>
            <th className="px-4 py-3 font-medium">Instrument</th>
            <th className="px-4 py-3 font-medium">Side</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Entry</th>
            <th className="px-4 py-3 font-medium">SL</th>
            <th className="px-4 py-3 font-medium">TP</th>
            <th className="px-4 py-3 font-medium">Filled</th>
            <th className="px-4 py-3 font-medium">Risk / Stop</th>
            <th className="px-4 py-3 font-medium">R</th>
            <th className="px-4 py-3 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => {
            const notes = formatNotes(trade.notes);

            return (
              <Fragment key={trade.id}>
                <tr className="border-b border-line">
                  <td className="px-4 py-3 font-mono text-gold uppercase">
                    {trade.playbooks?.slug ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-mist">{trade.instrument}</td>
                  <td className="px-4 py-3 uppercase text-mist">{trade.side}</td>
                  <td className="px-4 py-3 text-fog">{trade.status}</td>
                  <td className="px-4 py-3 font-mono text-mist">
                    {formatPrice(trade.planned_entry)}
                  </td>
                  <td className="px-4 py-3 font-mono text-mist">
                    {formatPrice(trade.planned_sl)}
                  </td>
                  <td className="px-4 py-3 font-mono text-mist">
                    {formatPrice(trade.planned_tp)}
                  </td>
                  <td className="px-4 py-3 font-mono text-mist">
                    {formatPrice(filledEntryDisplay(trade))}
                  </td>
                  <td className="px-4 py-3">
                    <TicketRiskReadout
                      riskDollars={
                        trade.status === "skipped" ? null : riskDollars
                      }
                      distance={
                        trade.status === "skipped"
                          ? null
                          : stopDistance(trade.planned_entry, trade.planned_sl)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-mist">
                    {formatR(trade.realized_r)}
                  </td>
                  <td className="max-w-[12rem] px-4 py-3 text-fog">
                    {notes ? (
                      <span className="block truncate" title={notes}>
                        {notes}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
                {trade.status === "planned" || trade.status === "open" ? (
                  <tr className="border-b border-line last:border-b-0">
                    <td colSpan={11} className="bg-ink/50 px-4 py-3">
                      <TradeFillForm trade={trade} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
