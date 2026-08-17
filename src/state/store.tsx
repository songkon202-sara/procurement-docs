import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CaseStatus, Category, DocId, PersonRow, LineItem, MeteredDocId, PrintScope, ProcurementData, SavedProject } from '../types';
import { createDefaultData, defaultCategory } from '../lib/defaultData';
import { makeId } from '../lib/id';
import { deleteFile, loadFile, saveFile } from '../lib/idbFiles';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../lib/persistence';
import { DOC_LIST, METERED_DOCS } from '../lib/docs';
import { nextNo } from '../lib/renumber';
import { addDaysToThaiDate } from '../lib/thaiDate';
import { blobToDataUrl, dataUrlToBlob, downloadJson, isBackupPayload, type BackupPayload } from '../lib/backup';
import { api, ApiError } from '../lib/api';
import { toCasePayload, fromCase, type ApiCase } from '../lib/caseMapping';

const DEFAULT_DATA = createDefaultData();

interface AppState {
  data: ProcurementData;
  category: Category;
  activeDoc: DocId;
  filterOn: boolean;
  printScope: PrintScope;
  printSet: Partial<Record<DocId, boolean>>;
  showReview: boolean;
  showProjects: boolean;
  printing: boolean;
  projects: SavedProject[];
  curProjectId: string;
  garudaUrl: string | null;
  garuda2Url: string | null;
  /** The backend case currently loaded, if any. null = unsaved local draft (not yet POSTed). */
  caseId: string | null;
  caseStatus: CaseStatus | null;
  caseOwnerId: string | null;
}

function initState(): AppState {
  return {
    data: loadJSON<ProcurementData>(STORAGE_KEYS.data) ?? DEFAULT_DATA,
    category: loadJSON<Category>(STORAGE_KEYS.category) ?? defaultCategory,
    activeDoc: 'approveReq',
    filterOn: true,
    printScope: 'current',
    printSet: loadJSON<Partial<Record<DocId, boolean>>>(STORAGE_KEYS.printSet) ?? {},
    showReview: false,
    showProjects: false,
    printing: false,
    projects: loadJSON<SavedProject[]>(STORAGE_KEYS.projects) ?? [],
    curProjectId: loadJSON<string>(STORAGE_KEYS.curProjectId) ?? '',
    garudaUrl: null,
    garuda2Url: null,
    caseId: null,
    caseStatus: null,
    caseOwnerId: null,
  };
}

interface AppContextValue {
  state: AppState;
  setCategory: (c: Category) => void;
  setActiveDoc: (id: DocId) => void;
  toggleFilter: () => void;
  setPrintScope: (s: PrintScope) => void;
  updateField: <K extends keyof ProcurementData>(name: K, value: ProcurementData[K]) => void;
  updateMeta: (key: MeteredDocId, field: 'no' | 'date', value: string) => void;
  autoNumberMeta: () => void;
  autoCalcVat: () => void;
  autoCalcDeliveryDue: () => void;
  addMember: (kind: 'committee' | 'inspectors') => void;
  removeMember: (kind: 'committee' | 'inspectors', id: string) => void;
  updateMember: (kind: 'committee' | 'inspectors', id: string, field: keyof PersonRow, value: string) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof LineItem, value: string) => void;
  uploadGaruda: (file: File) => void;
  clearGaruda: () => void;
  uploadGaruda2: (file: File) => void;
  clearGaruda2: () => void;
  openReview: () => void;
  closeReview: () => void;
  togglePrintDoc: (id: DocId) => void;
  setAllPrint: (on: boolean) => void;
  jumpDoc: (id: DocId) => void;
  reviewPrint: () => void;
  doPrint: () => void;
  openProjects: () => void;
  closeProjects: () => void;
  newCase: () => void;
  saveCase: () => Promise<void>;
  loadCase: (id: string) => Promise<void>;
  cancelCase: (id: string) => Promise<void>;
  performCaseAction: (action: string, comment?: string) => Promise<void>;
  exportBackup: () => Promise<void>;
  importBackup: (file: File) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initState);
  const defaultsRef = useRef<ProcurementData>(DEFAULT_DATA);
  const garudaUrlRef = useRef<string | null>(null);
  const garuda2UrlRef = useRef<string | null>(null);

  // Load Garuda emblem blobs from IndexedDB once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [small, large] = await Promise.all([loadFile('garuda'), loadFile('garuda2')]);
      if (cancelled) return;
      if (small) {
        const url = URL.createObjectURL(small);
        garudaUrlRef.current = url;
        setState((s) => ({ ...s, garudaUrl: url }));
      }
      if (large) {
        const url = URL.createObjectURL(large);
        garuda2UrlRef.current = url;
        setState((s) => ({ ...s, garuda2Url: url }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist form data / category / print checklist / saved projects / current project id.
  useEffect(() => saveJSON(STORAGE_KEYS.data, state.data), [state.data]);
  useEffect(() => saveJSON(STORAGE_KEYS.category, state.category), [state.category]);
  useEffect(() => saveJSON(STORAGE_KEYS.printSet, state.printSet), [state.printSet]);
  useEffect(() => saveJSON(STORAGE_KEYS.curProjectId, state.curProjectId), [state.curProjectId]);
  useEffect(() => saveJSON(STORAGE_KEYS.projects, state.projects), [state.projects]);

  const setCategory = useCallback((c: Category) => setState((s) => ({ ...s, category: c })), []);
  const setActiveDoc = useCallback((id: DocId) => setState((s) => ({ ...s, activeDoc: id })), []);
  const toggleFilter = useCallback(() => setState((s) => ({ ...s, filterOn: !s.filterOn })), []);
  const setPrintScope = useCallback((p: PrintScope) => setState((s) => ({ ...s, printScope: p })), []);

  const updateField = useCallback(
    <K extends keyof ProcurementData>(name: K, value: ProcurementData[K]) =>
      setState((s) => ({ ...s, data: { ...s.data, [name]: value } })),
    [],
  );

  const updateMeta = useCallback(
    (key: MeteredDocId, field: 'no' | 'date', value: string) =>
      setState((s) => ({
        ...s,
        data: { ...s.data, docmeta: { ...s.data.docmeta, [key]: { ...s.data.docmeta[key], [field]: value } } },
      })),
    [],
  );

  /** Renumbers all 7 metered documents +1 sequentially from the first one's current เลขที่. */
  const autoNumberMeta = useCallback(
    () =>
      setState((s) => {
        const base = s.data.docmeta[METERED_DOCS[0].key].no;
        const docmeta = { ...s.data.docmeta };
        METERED_DOCS.forEach((m, i) => {
          docmeta[m.key] = { ...docmeta[m.key], no: i === 0 ? base : nextNo(base, i) };
        });
        return { ...s, data: { ...s.data, docmeta } };
      }),
    [],
  );

  /** Splits the total วงเงิน into a pre-VAT subtotal + 7% VAT for the ใบสั่งซื้อ/สั่งจ้าง fields. */
  const autoCalcVat = useCallback(
    () =>
      setState((s) => {
        const amt = Number(String(s.data.amount).replace(/[, ]/g, ''));
        if (!Number.isFinite(amt) || amt <= 0) return s;
        const subtotal = Math.round((amt / 1.07) * 100) / 100;
        const vat = Math.round((amt - subtotal) * 100) / 100;
        return { ...s, data: { ...s.data, orderSubtotal: subtotal.toFixed(2), orderVat: vat.toFixed(2) } };
      }),
    [],
  );

  /** Computes ครบกำหนดส่งมอบ from วันที่ใบสั่ง + ระยะส่งมอบ (วัน). */
  const autoCalcDeliveryDue = useCallback(
    () =>
      setState((s) => {
        const days = Number(String(s.data.deliverDays).replace(/[, ]/g, ''));
        const computed = addDaysToThaiDate(s.data.orderDate, days);
        if (!computed) return s;
        return { ...s, data: { ...s.data, deliveryDueDate: computed } };
      }),
    [],
  );

  const addMember = useCallback(
    (kind: 'committee' | 'inspectors') =>
      setState((s) => ({
        ...s,
        data: { ...s.data, [kind]: [...s.data[kind], { id: makeId(), name: '', pos: '', role: 'กรรมการ' }] },
      })),
    [],
  );
  const removeMember = useCallback(
    (kind: 'committee' | 'inspectors', id: string) =>
      setState((s) => ({ ...s, data: { ...s.data, [kind]: s.data[kind].filter((m) => m.id !== id) } })),
    [],
  );
  const updateMember = useCallback(
    (kind: 'committee' | 'inspectors', id: string, field: keyof PersonRow, value: string) =>
      setState((s) => ({
        ...s,
        data: { ...s.data, [kind]: s.data[kind].map((m) => (m.id === id ? { ...m, [field]: value } : m)) },
      })),
    [],
  );

  const addItem = useCallback(
    () =>
      setState((s) => ({
        ...s,
        data: { ...s.data, items: [...s.data.items, { id: makeId(), name: '', qty: '1', unit: 'หน่วย', price: '0' }] },
      })),
    [],
  );
  const removeItem = useCallback(
    (id: string) => setState((s) => ({ ...s, data: { ...s.data, items: s.data.items.filter((it) => it.id !== id) } })),
    [],
  );
  const updateItem = useCallback(
    (id: string, field: keyof LineItem, value: string) =>
      setState((s) => ({
        ...s,
        data: { ...s.data, items: s.data.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)) },
      })),
    [],
  );

  const uploadGaruda = useCallback((file: File) => {
    void saveFile('garuda', file);
    const url = URL.createObjectURL(file);
    if (garudaUrlRef.current) URL.revokeObjectURL(garudaUrlRef.current);
    garudaUrlRef.current = url;
    setState((s) => ({ ...s, garudaUrl: url }));
  }, []);
  const clearGaruda = useCallback(() => {
    void deleteFile('garuda');
    if (garudaUrlRef.current) URL.revokeObjectURL(garudaUrlRef.current);
    garudaUrlRef.current = null;
    setState((s) => ({ ...s, garudaUrl: null }));
  }, []);
  const uploadGaruda2 = useCallback((file: File) => {
    void saveFile('garuda2', file);
    const url = URL.createObjectURL(file);
    if (garuda2UrlRef.current) URL.revokeObjectURL(garuda2UrlRef.current);
    garuda2UrlRef.current = url;
    setState((s) => ({ ...s, garuda2Url: url }));
  }, []);
  const clearGaruda2 = useCallback(() => {
    void deleteFile('garuda2');
    if (garuda2UrlRef.current) URL.revokeObjectURL(garuda2UrlRef.current);
    garuda2UrlRef.current = null;
    setState((s) => ({ ...s, garuda2Url: null }));
  }, []);

  const openReview = useCallback(() => setState((s) => ({ ...s, showReview: true })), []);
  const closeReview = useCallback(() => setState((s) => ({ ...s, showReview: false })), []);
  const togglePrintDoc = useCallback(
    (id: DocId) =>
      setState((s) => {
        const cur = s.printSet[id] !== false;
        return { ...s, printSet: { ...s.printSet, [id]: !cur } };
      }),
    [],
  );
  const setAllPrint = useCallback(
    (on: boolean) =>
      setState((s) => {
        const printSet: Partial<Record<DocId, boolean>> = {};
        DOC_LIST.forEach((d) => (printSet[d.id] = on));
        return { ...s, printSet };
      }),
    [],
  );
  const jumpDoc = useCallback(
    (id: DocId) => setState((s) => ({ ...s, activeDoc: id, showReview: false })),
    [],
  );

  const runPrint = useCallback((scope: PrintScope) => {
    setState((s) => ({ ...s, printScope: scope, printing: true, showReview: false }));
    setTimeout(() => {
      window.print();
      setTimeout(() => setState((s) => ({ ...s, printing: false })), 200);
    }, 90);
  }, []);
  const reviewPrint = useCallback(() => runPrint('all'), [runPrint]);
  const doPrint = useCallback(() => runPrint(state.printScope), [runPrint, state.printScope]);

  const openProjects = useCallback(() => setState((s) => ({ ...s, showProjects: true })), []);
  const closeProjects = useCallback(() => setState((s) => ({ ...s, showProjects: false })), []);
  const newCase = useCallback(
    () =>
      setState((s) => ({
        ...s,
        data: JSON.parse(JSON.stringify(defaultsRef.current)) as ProcurementData,
        caseId: null,
        caseStatus: null,
        caseOwnerId: null,
        showProjects: false,
      })),
    [],
  );

  /** Creates the case (POST) the first time, then edits it (PATCH) on every subsequent save. */
  const saveCase = useCallback(async () => {
    const { category, ...patch } = toCasePayload(state.data, state.category);
    try {
      const kase = state.caseId
        ? await api.patch<ApiCase>(`/cases/${state.caseId}`, patch)
        : await api.post<ApiCase>('/cases', { category, ...patch });
      setState((s) => ({ ...s, caseId: kase.id, caseStatus: kase.status, caseOwnerId: kase.ownerId, showProjects: false }));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'บันทึกโครงการไม่สำเร็จ');
    }
  }, [state.data, state.category, state.caseId]);

  const loadCase = useCallback(async (id: string) => {
    try {
      const kase = await api.get<ApiCase>(`/cases/${id}`);
      const { category, data } = fromCase(kase);
      setState((s) => ({ ...s, data, category, caseId: kase.id, caseStatus: kase.status, caseOwnerId: kase.ownerId, showProjects: false }));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'เปิดโครงการไม่สำเร็จ');
    }
  }, []);

  /**
   * Drives every workflow transition (submit/review_pass/review_reject/approve/reject/reopen/
   * complete) against the currently loaded case. The frontend has its own copy of which
   * actions make sense to show for a given status+role (see WorkflowBar.tsx), but that's only
   * to reduce friction -- the backend's TRANSITIONS table is the actual authority and rejects
   * anything not allowed regardless of what the UI offered.
   */
  const performCaseAction = useCallback(
    async (action: string, comment?: string) => {
      if (!state.caseId) return;
      try {
        const kase = await api.post<ApiCase>(`/cases/${state.caseId}/${action}`, comment ? { comment } : {});
        setState((s) => ({ ...s, caseStatus: kase.status }));
      } catch (err) {
        alert(err instanceof ApiError ? err.message : 'ดำเนินการไม่สำเร็จ');
      }
    },
    [state.caseId],
  );

  /** No real delete on the backend — cancel is the closest equivalent (only valid from draft/submitted). */
  const cancelCase = useCallback(async (id: string) => {
    try {
      await api.post(`/cases/${id}/cancel`);
      setState((s) => (s.caseId === id ? { ...s, caseId: null, caseStatus: null, caseOwnerId: null } : s));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'ยกเลิกโครงการไม่สำเร็จ');
    }
  }, []);

  const exportBackup = useCallback(async () => {
    const [smallBlob, largeBlob] = await Promise.all([loadFile('garuda'), loadFile('garuda2')]);
    const [garuda, garuda2] = await Promise.all([
      smallBlob ? blobToDataUrl(smallBlob) : Promise.resolve(null),
      largeBlob ? blobToDataUrl(largeBlob) : Promise.resolve(null),
    ]);
    const payload: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      category: state.category,
      data: state.data,
      projects: state.projects,
      printSet: state.printSet,
      curProjectId: state.curProjectId,
      garuda,
      garuda2,
    };
    const stamp = new Date().toISOString().slice(0, 10);
    const result = await downloadJson(payload, `procurement-docs-backup-${stamp}.json`);
    if (result === 'failed') alert('ไม่สามารถบันทึกไฟล์สำรองข้อมูลได้');
  }, [state.category, state.data, state.projects, state.printSet, state.curProjectId]);

  const importBackup = useCallback(async (file: File) => {
    const text = await file.text();
    const parsed: unknown = JSON.parse(text);
    if (!isBackupPayload(parsed)) throw new Error('ไฟล์สำรองไม่ถูกต้อง');

    if (parsed.garuda) {
      const blob = await dataUrlToBlob(parsed.garuda);
      await saveFile('garuda', blob);
      const url = URL.createObjectURL(blob);
      if (garudaUrlRef.current) URL.revokeObjectURL(garudaUrlRef.current);
      garudaUrlRef.current = url;
    }
    if (parsed.garuda2) {
      const blob = await dataUrlToBlob(parsed.garuda2);
      await saveFile('garuda2', blob);
      const url = URL.createObjectURL(blob);
      if (garuda2UrlRef.current) URL.revokeObjectURL(garuda2UrlRef.current);
      garuda2UrlRef.current = url;
    }

    setState((s) => ({
      ...s,
      data: parsed.data,
      category: parsed.category,
      projects: parsed.projects,
      printSet: parsed.printSet,
      curProjectId: parsed.curProjectId,
      showProjects: false,
      garudaUrl: garudaUrlRef.current,
      garuda2Url: garuda2UrlRef.current,
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      setCategory,
      setActiveDoc,
      toggleFilter,
      setPrintScope,
      updateField,
      updateMeta,
      autoNumberMeta,
      autoCalcVat,
      autoCalcDeliveryDue,
      addMember,
      removeMember,
      updateMember,
      addItem,
      removeItem,
      updateItem,
      uploadGaruda,
      clearGaruda,
      uploadGaruda2,
      clearGaruda2,
      openReview,
      closeReview,
      togglePrintDoc,
      setAllPrint,
      jumpDoc,
      reviewPrint,
      doPrint,
      openProjects,
      closeProjects,
      newCase,
      saveCase,
      loadCase,
      cancelCase,
      performCaseAction,
      exportBackup,
      importBackup,
    }),
    [
      state,
      setCategory,
      setActiveDoc,
      toggleFilter,
      setPrintScope,
      updateField,
      updateMeta,
      autoNumberMeta,
      autoCalcVat,
      autoCalcDeliveryDue,
      addMember,
      removeMember,
      updateMember,
      addItem,
      removeItem,
      updateItem,
      uploadGaruda,
      clearGaruda,
      uploadGaruda2,
      clearGaruda2,
      openReview,
      closeReview,
      togglePrintDoc,
      setAllPrint,
      jumpDoc,
      reviewPrint,
      doPrint,
      openProjects,
      closeProjects,
      newCase,
      saveCase,
      loadCase,
      cancelCase,
      performCaseAction,
      exportBackup,
      importBackup,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
