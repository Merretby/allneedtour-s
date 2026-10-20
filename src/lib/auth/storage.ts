import type { User } from "@/lib/api/types";

export const AUTH_STORAGE_KEY = "plg:auth";

export interface StoredAuth {
  token: string;
  user: User;
}

export function readAuthStorage(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeAuthStorage(auth: StoredAuth): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

/** Remove keys used by the old localStorage-only demo. */
export function clearLegacyDemoStorage(): void {
  if (typeof window === "undefined") return;
  ["users", "userSession", "cart", "favorites"].forEach((key) => {
    window.localStorage.removeItem(key);
  });
}
