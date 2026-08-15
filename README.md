# ระบบเอกสารจัดซื้อจัดจ้างภาครัฐ

React + TypeScript + Vite reimplementation of the `ระบบจัดการเอกสารจัดซื้อจัดจ้าง.dc.html` design prototype
(kept at the repo root, alongside a zip of the full original Claude Design handoff bundle, for reference).

## Run

```
npm install
npm run dev
```

## Build

```
npm run build
```

## Notes on the rebuild vs. the prototype

- **Sidebar-only editing.** The prototype had two edit paths for the same data (sidebar fields +
  inline `contentEditable`-style inputs inside the rendered documents). This rebuild keeps sidebar-only
  editing; the 13 documents render as read-only output driven by the shared form state.
- **Committee/inspectors/line items are typed arrays**, not pipe-delimited strings parsed on every render.
- **Garuda emblem uploads** are stored as real `Blob`s in IndexedDB (`src/lib/idbFiles.ts`) and referenced
  via object URL, instead of base64 data URLs in `localStorage`.
- Form data, category, print checklist and the saved-projects list persist to `localStorage`
  (`src/lib/persistence.ts`); this is a desktop-oriented, single-user tool with no backend.

## Compliance/audit-readiness checks (Tier 1)

Added after a procurement-compliance review, since these are the issues a หน่วยตรวจสอบ flags most often:

- **500,000-baht threshold warning** (`src/lib/validation.ts`) — flags when the total วงเงิน exceeds
  500,000 บาท but the document still cites วิธีเฉพาะเจาะจง มาตรา 56(2).
- **เลขที่/วันที่ sequence check** — warns when a later metered document's date precedes an earlier one's.
- **7% VAT arithmetic check** — warns when ภาษีมูลค่าเพิ่ม doesn't match 7% of the pre-VAT subtotal.
- **Auto-calculate helpers** (sidebar buttons): VAT split from the total amount, ครบกำหนดส่งมอบ from
  วันที่ใบสั่ง + ระยะส่งมอบ, and sequential renumbering of the 7 metered document numbers.
- **Full backup/export** (`src/lib/backup.ts`) — since all state lives in this browser only
  (localStorage + IndexedDB), the "โครงการ" modal can export/import a single `.json` file containing
  the current form, all saved projects, and both Garuda emblem images.
