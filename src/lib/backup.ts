import type { Category, DocId, ProcurementData, SavedProject } from '../types';
import { offerFileDownload, type OfferResult } from './fileOffer';

/**
 * Full-state backup format. Everything the app persists lives only on this one device
 * (localStorage + IndexedDB) — no backend — so this is the only way to move data between
 * machines or recover from a cleared browser profile.
 */
export interface BackupPayload {
  version: 1;
  exportedAt: string;
  category: Category;
  data: ProcurementData;
  projects: SavedProject[];
  printSet: Partial<Record<DocId, boolean>>;
  curProjectId: string;
  garuda: string | null;
  garuda2: string | null;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function downloadJson(payload: unknown, filename: string): Promise<OfferResult> {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  return offerFileDownload([{ filename, data: blob }]);
}

export function isBackupPayload(v: unknown): v is BackupPayload {
  return !!v && typeof v === 'object' && (v as { version?: unknown }).version === 1 && 'data' in v;
}
