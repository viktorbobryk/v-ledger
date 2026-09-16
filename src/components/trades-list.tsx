import type { Trade } from "@/lib/trades/types";

function formatPrice(value: number | string | null) {
  if (value === null) {
    return "—";
  }

  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function TradesList({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-fog">
        No tickets in this session.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-line bg-paper text-fog">
          <tr>
            <th className="px-4 py-3 font-medium">Playbook</th>
            <th className="px-4 py-3 font-medium">Instrument</th>
            <th className="px-4 py-3 font-medium">Side</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Planned</th>
            <th className="px-4 py-3 font-medium">Filled</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="border-b border-line last:border-b-0">
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
                {formatPrice(trade.filled_entry)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
