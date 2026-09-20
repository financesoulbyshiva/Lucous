import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RoleSelection } from "@/components/auth/role-selection";

export const metadata: Metadata = {
  title: "Welcome — LUCOUS",
  description: "Choose your role to continue to LUCOUS.",
};

export default function AuthPage() {
  return (
    <AuthLayout showChangeRole={false} containerClassName="max-w-3xl">
      <RoleSelection />
    </AuthLayout>
  );
}
