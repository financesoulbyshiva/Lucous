import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudentHome } from "@/components/student/student-home";
import { TeacherHome } from "@/components/teacher/teacher-home";
import { ParentHome } from "@/components/parent/parent-home";
import { AdminHome } from "@/components/admin/admin-home";
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

  if (role === "student") return <StudentHome />;
  if (role === "teacher") return <TeacherHome />;
  if (role === "parent") return <ParentHome />;
  return <AdminHome />;
}
