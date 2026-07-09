# ระบบเอกสารจัดซื้อจัดจ้างภาครัฐ

React + TypeScript + Vite reimplementation of the `ระบบจัดการเอกสารจัดซื้อจัดจ้าง.dc.html` design prototype
(see `../project/` and `../chats/` for the original design bundle).

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
