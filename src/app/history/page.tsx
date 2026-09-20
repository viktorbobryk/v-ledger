import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SessionHistoryList } from "@/components/session-history-list";
import { getAuthClaims } from "@/lib/auth/session";
import { listSessions } from "@/lib/sessions/list";

export default async function HistoryPage() {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "signed in";
  const { sessions, error } = await listSessions(claims.sub);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <AppHeader email={email} active="history" />

      <section className="mt-8">
        <h1 className="text-lg font-medium text-mist">History</h1>
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
