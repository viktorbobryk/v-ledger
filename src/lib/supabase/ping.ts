import { getSupabaseEnv } from "@/lib/supabase/env";

export async function pingSupabase() {
  const env = getSupabaseEnv();

  if (!env) {
    return { status: "unconfigured" as const };
  }

  try {
    const response = await fetch(`${env.url}/auth/v1/health`, {
      headers: {
        apikey: env.key,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "error" as const, message: `HTTP ${response.status}` };
    }

    return { status: "ok" as const, host: new URL(env.url).host };
  } catch (error) {
    return {
      status: "error" as const,
      message: error instanceof Error ? error.message : "Request failed",
    };
  }
}
