import Link from "next/link";
import {
  sessionRiskDollars,
  sessionStatus,
  sessionToday,
} from "@/lib/sessions/defaults";
import type { SessionSummary } from "@/lib/sessions/list";

function formatMoney(value: number | string) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatSignedMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${formatMoney(value)}`;
}

function pnlClassName(value: number | null) {
  if (value === null || value === 0) {
    return "text-mist";
  }

  return value > 0 ? "text-gain" : "text-loss";
}

export function SessionHistoryList({ sessions }: { sessions: SessionSummary[] }) {
  const today = sessionToday();
  const past = sessions.filter((session) => session.session_date !== today);

  if (past.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-fog">
        No past sessions yet. Today stays on the desk.
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-line">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-line bg-paper text-fog">
          <tr>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Deposit</th>
            <th className="px-4 py-3 font-medium">Risk</th>
            <th className="px-4 py-3 font-medium">P&L</th>
            <th className="px-4 py-3 font-medium">Tickets</th>
          </tr>
        </thead>
        <tbody>
          {past.map((session) => {
            const status = sessionStatus(
              session.consecutive_losses,
              session.status,
            );
            const risk = sessionRiskDollars(
              session.deposit,
              session.risk_percent,
            );

            return (
              <tr key={session.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/history/${session.session_date}`}
                    className="font-mono text-gold hover:underline"
                  >
                    {session.session_date}
                  </Link>
                </td>
                <td className="px-4 py-3 uppercase text-fog">{status}</td>
                <td className="px-4 py-3 font-mono text-mist">
                  ${formatMoney(session.deposit)}
                </td>
                <td className="px-4 py-3 font-mono text-mist">
                  {risk === null ? "—" : `$${formatMoney(risk)}`}
                </td>
                <td className={`px-4 py-3 font-mono ${pnlClassName(session.pnl_dollars)}`}>
                  {session.pnl_dollars === null
                    ? "—"
                    : formatSignedMoney(session.pnl_dollars)}
                </td>
                <td className="px-4 py-3 font-mono text-mist">
                  {session.ticket_count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
