import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getAuthClaims } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const claims = await getAuthClaims();

  if (claims) {
    redirect("/");
  }

  const { error, notice } = await searchParams;

  return <AuthForm mode="login" error={error} notice={notice} />;
}
