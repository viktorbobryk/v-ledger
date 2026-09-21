import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { PlaybookStatsTable } from "@/components/playbook-stats-table";
import { SessionHistoryList } from "@/components/session-history-list";
import { getAuthClaims } from "@/lib/auth/session";
import { listPlaybooks } from "@/lib/playbooks/list";
import { listPlaybookStats } from "@/lib/playbooks/stats";
import { listSessions } from "@/lib/sessions/list";

export default async function HistoryPage() {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "signed in";
  const [{ sessions, error }, { playbooks, error: playbooksError }] =
    await Promise.all([
      listSessions(claims.sub),
      listPlaybooks(claims.sub),
    ]);
  const { stats, error: statsError } = await listPlaybookStats(
    claims.sub,
    playbooks.map((playbook) => playbook.id),
  );

  return (
    <main className="mx-auto max-w-3xl p-6">
      <AppHeader email={email} active="history" />

      <section className="mt-8">
        <h1 className="text-lg font-medium text-mist">Playbooks</h1>
        <p className="mt-1 text-sm text-fog">
          Closed trades across all days. Skips are listed separately.
        </p>
        {playbooksError || statsError ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {playbooksError ?? statsError}
          </p>
        ) : (
          <PlaybookStatsTable playbooks={playbooks} stats={stats} />
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-mist">Sessions</h2>
        <p className="mt-1 text-sm text-fog">
          Past sessions. Today stays on the desk.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {error}
          </p>
        ) : (
          <SessionHistoryList sessions={sessions} />
        )}
      </section>
    </main>
  );
}
