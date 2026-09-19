import { updateSessionRisk } from "@/app/actions/sessions";
import {
  PAUSE_AFTER_LOSSES,
  sessionRiskDollars,
  sessionStatus,
  type TradingSession,
} from "@/lib/sessions/defaults";

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-sm text-mist outline-none placeholder:text-fog/70 focus:border-gold focus:ring-2 focus:ring-gold/30";

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function SessionStrip({ session }: { session: TradingSession }) {
  const status = sessionStatus(session.consecutive_losses, session.status);
  const isPause = status === "pause";
  const riskUnit = sessionRiskDollars(session.deposit, session.risk_percent);

  return (
    <form
      action={updateSessionRisk}
      className="rounded-xl border border-line bg-paper p-5"
    >
      <input type="hidden" name="session_id" value={session.id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-gold">SESSION</p>
          <p className="mt-1 font-mono text-sm text-fog">{session.session_date}</p>
        </div>
        <p
          className={`rounded-md px-2.5 py-1 font-mono text-xs tracking-[0.18em] uppercase ${
            isPause ? "bg-loss/10 text-loss" : "bg-gain/10 text-gain"
          }`}
        >
          {status}
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-fog">
          Deposit
          <input
            name="deposit"
            type="number"
            required
            min="0.01"
            step="any"
            inputMode="decimal"
            defaultValue={Number(session.deposit)}
            className={fieldClassName}
          />
        </label>
        <label className="text-sm text-fog">
          Risk %
          <input
            name="risk_percent"
            type="number"
            required
            min="0.01"
            max="100"
            step="any"
            inputMode="decimal"
            defaultValue={Number(session.risk_percent)}
            className={fieldClassName}
          />
        </label>
        <div>
          <p className="text-sm text-fog">Loss streak</p>
          <p className="mt-1.5 font-mono text-sm text-mist">
            {session.consecutive_losses} / {PAUSE_AFTER_LOSSES}
          </p>
          <p className="mt-1 text-xs text-fog">
            {riskUnit === null ? "—" : `$${formatNumber(riskUnit)}`} per ticket
          </p>
        </div>
      </div>
      <button
        type="submit"
        className="mt-5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink hover:bg-gold/90"
      >
        Save risk
      </button>
    </form>
  );
}
