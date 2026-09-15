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
    <main className="p-6">
      <p>{email}</p>
      <form action={signOut}>
        <button type="submit" className="border px-2 py-1">
          Log out
        </button>
      </form>
      {supabase.status === "ok" ? (
        <p>Supabase connected: {supabase.host}</p>
      ) : supabase.status === "unconfigured" ? (
        <p>Supabase is not configured. Add keys to .env.local</p>
      ) : (
        <p>Supabase error: {supabase.message}</p>
      )}
    </main>
  );
}
