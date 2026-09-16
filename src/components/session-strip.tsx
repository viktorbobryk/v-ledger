import {
  PAUSE_AFTER_LOSSES,
  sessionStatus,
  type TradingSession,
} from "@/lib/sessions/defaults";

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function SessionStrip({ session }: { session: TradingSession }) {
  const status = sessionStatus(session.consecutive_losses, session.status);
  const isPause = status === "pause";

  return (
    <section className="rounded-xl border border-line bg-paper p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-gold">SESSION</p>
          <p className="mt-1 font-mono text-sm text-fog">{session.session_date}</p>
        </div>
        <p
          className={`rounded-md px-2.5 py-1 font-mono text-xs tracking-[0.18em] uppercase ${
            isPause
              ? "bg-loss/10 text-loss"
              : "bg-gain/10 text-gain"
          }`}
        >
          {status}
        </p>
      </div>
      <dl className="mt-5 grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-fog">Deposit</dt>
          <dd className="mt-1 font-mono text-mist">
            ${formatNumber(session.deposit)}
          </dd>
        </div>
        <div>
          <dt className="text-fog">Risk</dt>
          <dd className="mt-1 font-mono text-mist">
            {formatNumber(session.risk_percent)}%
          </dd>
        </div>
        <div>
          <dt className="text-fog">Loss streak</dt>
          <dd className="mt-1 font-mono text-mist">
            {session.consecutive_losses} / {PAUSE_AFTER_LOSSES}
          </dd>
        </div>
      </dl>
    </section>
  );
}
