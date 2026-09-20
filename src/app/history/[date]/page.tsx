import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SessionStrip } from "@/components/session-strip";
import { TradesList } from "@/components/trades-list";
import { getAuthClaims } from "@/lib/auth/session";
import {
  parseSessionDate,
  sessionRiskDollars,
  utcToday,
} from "@/lib/sessions/defaults";
import { getSessionByDate } from "@/lib/sessions/list";
import { listSessionTrades } from "@/lib/trades/list";

type HistoryDatePageProps = {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function HistoryDatePage({
  params,
  searchParams,
}: HistoryDatePageProps) {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const { date: dateParam } = await params;
  const date = parseSessionDate(dateParam);

  if (!date) {
    notFound();
  }

  if (date === utcToday()) {
    redirect("/");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "signed in";
  const { error } = await searchParams;
  const { session, error: sessionError } = await getSessionByDate(
    claims.sub,
    date,
  );
  const { trades, error: tradesError } = session
    ? await listSessionTrades(session.id)
    : { trades: [], error: sessionError };
  const riskDollars = session
    ? sessionRiskDollars(session.deposit, session.risk_percent)
    : null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <AppHeader email={email} active="history" />

      {error ? (
        <p className="mt-6 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
          {error}
        </p>
      ) : null}

      <section className="mt-8">
        <p className="text-sm text-fog">
          <Link href="/history" className="text-gold hover:underline">
            History
          </Link>
        </p>
        <h1 className="mt-2 text-lg font-medium text-mist">{date}</h1>
        <p className="mt-1 text-sm text-fog">
          Past session. Close or skip leftovers. New locks are only on the desk.
        </p>
        {sessionError || !session ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {sessionError ?? "No session for that date."}
          </p>
        ) : (
          <div className="mt-5">
            <SessionStrip session={session} readOnly />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-mist">Tickets</h2>
        {tradesError ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {tradesError}
          </p>
        ) : (
          <TradesList trades={trades} riskDollars={riskDollars} />
        )}
      </section>
    </main>
  );
}
