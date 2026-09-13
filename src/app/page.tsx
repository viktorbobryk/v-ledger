import { pingSupabase } from "@/lib/supabase/ping";

export default async function Home() {
  const supabase = await pingSupabase();

  return (
    <main>
      <div>Hello world!!</div>
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
