import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleGate } from "@/components/auth/role-gate";
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
  return { title: `${ROLE_CONFIG[role].label} dashboard — LUCOUS` };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  if (!isAuthRole(role)) notFound();

  return <RoleGate role={role} />;
}
