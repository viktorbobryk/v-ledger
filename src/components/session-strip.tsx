import { updateSessionRisk } from "@/app/actions/sessions";
import {
  PAUSE_AFTER_LOSSES,
  pauseRiskDollars,
  sessionEquity,
  sessionRiskDollars,
  sessionStatus,
  type TradingSession,
} from "@/lib/sessions/defaults";

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 font-mono text-sm text-mist outline-none placeholder:text-fog/70 focus:border-gold focus:ring-2 focus:ring-gold/30";

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function formatSignedMoney(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}$${formatNumber(value)}`;
}

function pnlClassName(value: number | null) {
  if (value === null || value === 0) {
    return "text-mist";
  }

  return value > 0 ? "text-gain" : "text-loss";
}

export function SessionStrip({
  session,
  pnlDollars,
  readOnly = false,
}: {
  session: TradingSession;
  pnlDollars: number | null;
  readOnly?: boolean;
}) {
  const status = sessionStatus(session.consecutive_losses, session.status);
  const isPause = status === "pause";
  const riskUnit = sessionRiskDollars(session.deposit, session.risk_percent);
  const pauseDollars = pauseRiskDollars(riskUnit);
  const equity = sessionEquity(session.deposit, pnlDollars);

  return (
    <form
      action={readOnly ? undefined : updateSessionRisk}
      className="rounded-xl border border-line bg-paper p-5"
    >
      {readOnly ? null : (
        <input type="hidden" name="session_id" value={session.id} />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-gold">SESSION</p>
          <p className="mt-1 font-mono text-sm text-fog">
            {session.session_date}
            <span className="text-fog/70"> · Kyiv</span>
          </p>
        </div>
        <p
          className={`rounded-md px-2.5 py-1 font-mono text-xs tracking-[0.18em] uppercase ${
            isPause ? "bg-loss/10 text-loss" : "bg-gain/10 text-gain"
          }`}
        >
          {status}
        </p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {readOnly ? (
          <>
            <div>
              <p className="text-sm text-fog">Deposit</p>
              <p className="mt-1.5 font-mono text-sm text-mist">
                ${formatNumber(session.deposit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-fog">Risk %</p>
              <p className="mt-1.5 font-mono text-sm text-mist">
                {formatNumber(session.risk_percent)}%
              </p>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
        <div>
          <p className="text-sm text-fog">Day P&L</p>
          <p className={`mt-1.5 font-mono text-sm ${pnlClassName(pnlDollars)}`}>
            {pnlDollars === null ? "—" : formatSignedMoney(pnlDollars)}
          </p>
          <p className="mt-1 text-xs text-fog">
            {equity === null ? "—" : `Equity $${formatNumber(equity)}`}
          </p>
        </div>
        <div>
          <p className="text-sm text-fog">Loss streak</p>
          <p className="mt-1.5 font-mono text-sm text-mist">
            {session.consecutive_losses} / {PAUSE_AFTER_LOSSES}
          </p>
          <p className="mt-1 text-xs text-fog">
            {riskUnit === null || pauseDollars === null
              ? "—"
              : `$${formatNumber(riskUnit)} / ticket · pause $${formatNumber(pauseDollars)}`}
          </p>
        </div>
      </div>
      {readOnly ? null : (
        <button
          type="submit"
          className="mt-5 rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink hover:bg-gold/90"
        >
          Save risk
        </button>
      )}
    </form>
  );
}
