import Link from "next/link";
import { signIn, signUp } from "@/app/actions/auth";

type AuthFormProps = {
  mode: "login" | "signup";
  error?: string;
  notice?: string;
};

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-mist outline-none placeholder:text-fog/70 focus:border-gold focus:ring-2 focus:ring-gold/30";

export function AuthForm({ mode, error, notice }: AuthFormProps) {
  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-8 font-mono text-xs tracking-[0.28em] text-gold">
          V LEDGER
        </p>
        <section className="rounded-xl border border-line bg-paper p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <h1 className="text-lg font-medium text-mist">
            {isLogin ? "Log in" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-fog">
            {isLogin
              ? "Open the desk with your email."
              : "One account. Your trades stay on this ledger."}
          </p>
          {notice ? (
            <p className="mt-4 rounded-md border border-gain/30 bg-gain/10 px-3 py-2 text-sm text-gain">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p className="mt-4 rounded-md border border-loss/30 bg-loss/10 px-3 py-2 text-sm text-loss">
              {error}
            </p>
          ) : null}
          <form
            action={isLogin ? signIn : signUp}
            className="mt-6 flex flex-col gap-4"
          >
            <label className="text-sm text-fog">
              Email
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClassName}
              />
            </label>
            <label className="text-sm text-fog">
              Password
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? "current-password" : "new-password"}
                placeholder="At least 6 characters"
                className={fieldClassName}
              />
            </label>
            <button
              type="submit"
              className="mt-1 rounded-md bg-gold px-3 py-2 text-sm font-medium text-ink hover:bg-gold/90"
            >
              {isLogin ? "Log in" : "Create account"}
            </button>
          </form>
        </section>
        <p className="mt-5 text-center text-sm text-fog">
          {isLogin ? (
            <>
              Need an account?{" "}
              <Link href="/signup" className="text-gold hover:underline">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-gold hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
