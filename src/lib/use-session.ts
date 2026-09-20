"use client";

import { useSyncExternalStore } from "react";
import {
  getSessionSnapshot,
  subscribeSession,
  type AuthSession,
} from "@/lib/auth";

/** Hydration-safe reactive read of the frontend session (client-only). */
export function useSession(): AuthSession | null {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, () => null);
}
