/**
 * localStorage wrapper that never throws. Needed because some browsers
 * (notably Safari) can raise a SecurityError for localStorage access on a
 * `file://` origin, and private-browsing modes can throw on quota. Every
 * call degrades to an in-memory fallback so the app keeps working for the
 * current session even when persistence is unavailable.
 */
const memoryFallback = new Map<string, string>();

export const safeStorage = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return memoryFallback.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      memoryFallback.set(key, value);
    }
  },
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      memoryFallback.delete(key);
    }
  },
};
