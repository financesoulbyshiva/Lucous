import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { AUTH_ROLES, ROLE_CONFIG, isAuthRole } from "@/lib/auth";

export function generateStaticParams() {
  return AUTH_ROLES.map((role) => ({ role }));
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
    title: `${ROLE_CONFIG[role].label} login — LUCOUS`,
    description: `Sign in to LUCOUS as a ${ROLE_CONFIG[role].label.toLowerCase()}.`,
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  return (
    <AuthLayout>
      <LoginForm role={role} />
    </AuthLayout>
  );
}
