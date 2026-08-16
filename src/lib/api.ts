/**
 * Thin fetch wrapper for the backend (see ../../backend). Mirrors the error shape
 * backend/src/errorHandler.ts sends — { error, details? } — so callers can show the same
 * message the server produced instead of a generic "something went wrong".
 */

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  details?: string[];
  constructor(status: number, message: string, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let authToken: string | null = null;

/** Called by state/auth.tsx whenever the login token changes (including on logout → null). */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

let unauthorizedHandler: (() => void) | null = null;

/** state/auth.tsx registers its logout() here, so an expired/invalid token (401 from any call) clears the session instead of leaving the UI stuck retrying with a dead token. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body: { error?: string; details?: string[] } = await res.json().catch(() => ({}));
    if (res.status === 401 && authToken) unauthorizedHandler?.();
    throw new ApiError(res.status, body.error ?? `เกิดข้อผิดพลาด (HTTP ${res.status})`, body.details);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown): Promise<T> =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
};
