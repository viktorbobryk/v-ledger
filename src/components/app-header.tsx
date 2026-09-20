import Link from "next/link";
import { signOut } from "@/app/actions/auth";

export function AppHeader({
  email,
  active,
}: {
  email: string;
  active: "desk" | "history";
}) {
  const tabClass = (tab: "desk" | "history") =>
    `rounded-md px-2.5 py-1 text-sm ${
      active === tab
        ? "border border-gold text-gold"
        : "border border-transparent text-fog hover:border-line hover:text-mist"
    }`;

  return (
    <header className="flex items-center justify-between border-b border-line pb-4">
      <div className="flex items-center gap-6">
        <p className="font-mono text-xs tracking-[0.28em] text-gold">V LEDGER</p>
        <nav className="flex items-center gap-1">
          <Link href="/" className={tabClass("desk")}>
            Desk
          </Link>
          <Link href="/history" className={tabClass("history")}>
            History
          </Link>
        </nav>
      </div>
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
  );
}
