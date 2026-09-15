import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getAuthClaims } from "@/lib/auth/session";

type SignupPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const claims = await getAuthClaims();

  if (claims) {
    redirect("/");
  }

  const { error } = await searchParams;

  return <AuthForm mode="signup" error={error} />;
}
