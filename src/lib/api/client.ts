import { clearAuthStorage, readAuthStorage } from "@/lib/auth/storage";
import type { ApiErrorPayload } from "./types";

const FALLBACK_BASE_URL = "/api/v1";

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  FALLBACK_BASE_URL;

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal, timeoutMs = 20000 } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  const stored = readAuthStorage();
  if (auth && stored?.token) {
    headers.Authorization = `Bearer ${stored.token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: signal ?? controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    let payload: unknown = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const errorPayload = (payload as { error?: ApiErrorPayload } | null)?.error;

      if (response.status === 401 && auth && stored?.token) {
        clearAuthStorage();
        if (typeof window !== "undefined" && window.location.pathname !== "/auth") {
          window.location.assign("/auth");
        }
      }

      throw new ApiError(
        response.status,
        errorPayload?.message || response.statusText || "Request failed",
        errorPayload?.code,
        errorPayload?.details
      );
    }

    if (
      payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "data" in (payload as Record<string, unknown>)
    ) {
      return (payload as unknown as { data: T }).data;
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}
