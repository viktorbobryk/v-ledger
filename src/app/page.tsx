import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { getAuthClaims } from "@/lib/auth/session";
import { pingSupabase } from "@/lib/supabase/ping";

export default async function Home() {
  const claims = await getAuthClaims();

  if (!claims) {
    redirect("/login");
  }

  const supabase = await pingSupabase();
  const email =
    typeof claims.email === "string" ? claims.email : "signed in";

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
      <p className="mt-6 text-sm text-fog">
        {supabase.status === "ok" ? (
          <>Supabase connected: {supabase.host}</>
        ) : supabase.status === "unconfigured" ? (
          <>Supabase is not configured. Add keys to .env.local</>
        ) : (
          <>Supabase error: {supabase.message}</>
        )}
      </p>
    </main>
  );
}
