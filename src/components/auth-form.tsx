import { signIn, signUp } from "@/app/actions/auth";

type AuthFormProps = {
  mode: "login" | "signup";
  error?: string;
  notice?: string;
};

export function AuthForm({ mode, error, notice }: AuthFormProps) {
  const isLogin = mode === "login";

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl">{isLogin ? "Log in" : "Sign up"}</h1>
      {notice ? <p className="mb-3">{notice}</p> : null}
      {error ? <p className="mb-3">{error}</p> : null}
      <form
        action={isLogin ? signIn : signUp}
        className="flex flex-col gap-3"
      >
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          className="border px-2 py-1"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder="Password"
          className="border px-2 py-1"
        />
        <button type="submit" className="border px-2 py-1">
          {isLogin ? "Log in" : "Create account"}
        </button>
      </form>
      <p className="mt-4">
        {isLogin ? (
          <a href="/signup">Need an account?</a>
        ) : (
          <a href="/login">Already have an account?</a>
        )}
      </p>
    </main>
  );
}
