import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignupForm } from "@/components/auth/signup-form";
import { AUTH_ROLES, ROLE_CONFIG, isAuthRole } from "@/lib/auth";

export function generateStaticParams() {
  return AUTH_ROLES.filter((role) => ROLE_CONFIG[role].allowsSignup).map(
    (role) => ({ role })
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role } = await params;
  if (!isAuthRole(role)) return {};
  return {
    title: `${ROLE_CONFIG[role].label} signup — LUCOUS`,
    description: `Create your LUCOUS ${ROLE_CONFIG[role].label.toLowerCase()} account.`,
  };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  // Admin has no public signup.
  if (!isAuthRole(role) || !ROLE_CONFIG[role].allowsSignup) notFound();

  return (
    <AuthLayout>
      <SignupForm role={role} />
    </AuthLayout>
  );
}
