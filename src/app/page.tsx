import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { PlaybookCard } from "@/components/playbook-card";
import { SessionStrip } from "@/components/session-strip";
import { TicketForm } from "@/components/ticket-form";
import { TradesList } from "@/components/trades-list";
import { getAuthClaims } from "@/lib/auth/session";
import { listPlaybooks } from "@/lib/playbooks/list";
import { ensureTodaySession } from "@/lib/sessions/ensure-today";
import { sessionRiskDollars } from "@/lib/sessions/defaults";
import { listSessionTrades } from "@/lib/trades/list";

type HomeProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "signed in";
  const [{ playbooks, error: playbooksError }, { session, error: sessionError }] =
    await Promise.all([
      listPlaybooks(claims.sub),
      ensureTodaySession(claims.sub),
    ]);
  const { trades, error: tradesError } = session
    ? await listSessionTrades(session.id)
    : { trades: [], error: sessionError };
  const { error } = await searchParams;
  const riskDollars = session
    ? sessionRiskDollars(session.deposit, session.risk_percent)
    : null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <p className="font-mono text-xs tracking-[0.28em] text-gold">V LEDGER</p>
        <div className="flex items-center gap-3">
          <p className="text-sm text-fog">{email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-line px-3 py-1.5 text-sm text-mist hover:border-gold hover:text-gold"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      {error ? (
        <p className="mt-6 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
          {error}
        </p>
      ) : null}

      <section className="mt-8">
        <h1 className="text-lg font-medium text-mist">Today</h1>
        <p className="mt-1 text-sm text-fog">
          Risk for the day. Pause after three losses.
        </p>
        {sessionError || !session ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {sessionError ?? "No session for today."}
          </p>
        ) : (
          <div className="mt-5">
            <SessionStrip session={session} />
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-mist">Tickets</h2>
        <p className="mt-1 text-sm text-fog">
          Lock the plan. Filled entry is the planned price. Skip if price never
          tagged it.
        </p>
        {session ? (
          <TicketForm
            sessionId={session.id}
            riskDollars={riskDollars}
            playbooks={playbooks}
          />
        ) : null}
        {tradesError ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {tradesError}
          </p>
        ) : (
          <TradesList trades={trades} riskDollars={riskDollars} />
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-mist">Playbooks</h2>
        <p className="mt-1 text-sm text-fog">
          The four setups from the TradingView desk.
        </p>
        {playbooksError ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {playbooksError}
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {playbooks.map((playbook) => (
              <PlaybookCard key={playbook.id} playbook={playbook} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
