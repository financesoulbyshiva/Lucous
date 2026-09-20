import {
  GraduationCap,
  Presentation,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const AUTH_ROLES = ["student", "parent", "teacher", "admin"] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

export function isAuthRole(value: string): value is AuthRole {
  return (AUTH_ROLES as readonly string[]).includes(value);
}

export const ROLE_CONFIG: Record<
  AuthRole,
  {
    label: string;
    tagline: string;
    icon: LucideIcon;
    allowsSignup: boolean;
    dashboardPath:
      | "/student/dashboard"
      | "/parent/dashboard"
      | "/teacher/dashboard"
      | "/admin/dashboard";
  }
> = {
  student: {
    label: "Student",
    tagline: "Learn, practice and improve",
    icon: GraduationCap,
    allowsSignup: true,
    dashboardPath: "/student/dashboard",
  },
  parent: {
    label: "Parent",
    tagline: "Support your child's learning",
    icon: Users,
    allowsSignup: true,
    dashboardPath: "/parent/dashboard",
  },
  teacher: {
    label: "Teacher",
    tagline: "Teach, manage and monitor",
    icon: Presentation,
    allowsSignup: true,
    dashboardPath: "/teacher/dashboard",
  },
  admin: {
    label: "Admin",
    tagline: "Manage the LUCOUS platform",
    icon: ShieldCheck,
    allowsSignup: false,
    dashboardPath: "/admin/dashboard",
  },
};

export interface SignupField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "tel";
  placeholder: string;
  autoComplete?: string;
}

const EMAIL_FIELD: SignupField = {
  name: "email",
  label: "Email",
  type: "email",
  placeholder: "Enter your email",
  autoComplete: "email",
};
const PASSWORD_FIELD: SignupField = {
  name: "password",
  label: "Password",
  type: "password",
  placeholder: "Enter your password",
  autoComplete: "new-password",
};
const CONFIRM_FIELD: SignupField = {
  name: "confirmPassword",
  label: "Confirm password",
  type: "password",
  placeholder: "Confirm your password",
  autoComplete: "new-password",
};
const MOBILE_FIELD: SignupField = {
  name: "mobile",
  label: "Mobile number",
  type: "tel",
  placeholder: "Enter your mobile number",
  autoComplete: "tel",
};

export const SIGNUP_FIELDS: Record<AuthRole, SignupField[]> = {
  student: [
    {
      name: "fullName",
      label: "Full name",
      type: "text",
      placeholder: "Enter your name",
      autoComplete: "name",
    },
    EMAIL_FIELD,
    PASSWORD_FIELD,
    CONFIRM_FIELD,
    {
      name: "grade",
      label: "Class / Grade",
      type: "text",
      placeholder: "Enter your class",
    },
    {
      name: "board",
      label: "Board",
      type: "text",
      placeholder: "Enter your board",
    },
  ],
  parent: [
    {
      name: "parentName",
      label: "Parent name",
      type: "text",
      placeholder: "Enter your name",
      autoComplete: "name",
    },
    EMAIL_FIELD,
    MOBILE_FIELD,
    PASSWORD_FIELD,
    CONFIRM_FIELD,
    {
      name: "connectionCode",
      label: "Student connection code",
      type: "text",
      placeholder: "Enter student connection code",
    },
  ],
  teacher: [
    {
      name: "fullName",
      label: "Full name",
      type: "text",
      placeholder: "Enter your name",
      autoComplete: "name",
    },
    EMAIL_FIELD,
    MOBILE_FIELD,
    PASSWORD_FIELD,
    CONFIRM_FIELD,
    {
      name: "school",
      label: "School / Institution",
      type: "text",
      placeholder: "Enter your school or institution",
    },
    {
      name: "subject",
      label: "Subject",
      type: "text",
      placeholder: "Enter your subject",
    },
  ],
  admin: [],
};

/* Frontend-only session stub. Swap these helpers for real auth API calls
   once the backend exists — no other auth UI code needs to change. */

export interface AuthSession {
  role: AuthRole;
  email: string;
  name?: string;
}

const SESSION_KEY = "lucous.session";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  return parseSession(window.localStorage.getItem(SESSION_KEY));
}

export function setSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

let cachedRaw: string | null | undefined;
let cachedSession: AuthSession | null = null;

export function getSessionSnapshot(): AuthSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSession = parseSession(raw);
  }
  return cachedSession;
}

function parseSession(raw: string | null): AuthSession | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    return isAuthRole(parsed?.role) ? parsed : null;
  } catch {
    return null;
  }
}

export function subscribeSession(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
