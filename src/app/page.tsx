import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { PlaybookCard } from "@/components/playbook-card";
import { getAuthClaims } from "@/lib/auth/session";
import { listPlaybooks } from "@/lib/playbooks/list";

export default async function Home() {
  const claims = await getAuthClaims();

  if (!claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "signed in";
  const { playbooks, error } = await listPlaybooks(claims.sub);

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
      <section className="mt-8">
        <h1 className="text-lg font-medium text-mist">Playbooks</h1>
        <p className="mt-1 text-sm text-fog">
          The four setups from the TradingView desk.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
            {error}
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
