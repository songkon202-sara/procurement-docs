/** Thin localStorage JSON helpers — swallow errors (private mode, quota, etc.) like the prototype did. */

export function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/availability errors
  }
}

export function loadString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export const STORAGE_KEYS = {
  data: 'proc_data_v2',
  category: 'proc_cat',
  printSet: 'proc_printset',
  curProjectId: 'proc_curproj',
  projects: 'proc_projects_v2',
} as const;
