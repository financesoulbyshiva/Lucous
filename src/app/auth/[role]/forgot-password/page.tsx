import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
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
    title: `Forgot password — ${ROLE_CONFIG[role].label} — LUCOUS`,
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  return (
    <AuthLayout>
      <ForgotPasswordForm role={role} />
    </AuthLayout>
  );
}
