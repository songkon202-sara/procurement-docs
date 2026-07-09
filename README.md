# Handoff: ระบบจัดการเอกสารจัดซื้อจัดจ้างภาครัฐ (Government Procurement Document Manager)

## Overview
A single-page tool for generating the 13 standard Thai government procurement documents (ตาม พ.ร.บ. จัดซื้อจัดจ้างฯ พ.ศ. 2560) — memos, TOR, price-comparison forms, purchase/hire orders, inspection reports, etc. — from one shared set of form data. Users fill in project data once in a left-hand panel; the right-hand panel live-renders all 13 documents (each a simulated A4 page), which can be printed to PDF or exported to Word (.doc).

## About the Design Files
The bundled file (`ระบบจัดการเอกสารจัดซื้อจัดจ้าง.dc.html`) is a **working HTML/React prototype**, not production code to ship as-is. It runs on a proprietary internal component runtime (a `support.js` script + custom template tags) that only exists in the design tool it was built in — **do not copy `support.js` or the `<x-dc>`/`sc-for`/`sc-if` markup into a real codebase**. Treat this file as the functional and visual spec. The task is to **recreate this behavior in the target codebase's actual stack** (React/Vue/plain JS — whichever the project already uses, or the best fit if none exists) using that stack's normal patterns.

## Fidelity
**High-fidelity.** Colors, typography, spacing, copy text (Thai legal/procurement boilerplate), and interactions in the file are final and should be recreated precisely, not just used as loose reference.

## Known Issues to Fix in the Rebuild
The user has flagged these three problem areas specifically — prioritize solving them cleanly in the rebuild rather than porting the current implementation's approach as-is:

1. **Settings (ตราครุฑ / logo uploads, category switch)** — Garuda emblem (ครุฑ) images are stored as base64 data URLs directly in `localStorage` (`proc_garuda`, `proc_garuda2`). This is fragile (storage quota limits, no real persistence/versioning, lost if the user clears browser storage, not shareable between devices/users). Recreate with real file storage (uploaded asset + URL reference) rather than inline base64 in local storage.
2. **Documents (data model)** — All repeating data (committee members, inspectors, line items) is stored as **pipe-delimited strings parsed on every render** (e.g. `"name | position | role"` joined by `\n`), see `rows()`, `parseEdit()`, `updateMember()`, `updateItem()` in the logic class. This is brittle — a `|` or newline typed by a user in a name field would corrupt parsing, and it makes validation/typing impossible. Recreate with proper arrays of typed objects in state (e.g. `committee: [{name, pos, role}]`), with add/remove/update operating on the array directly.
3. **Document editing** — Two parallel edit paths exist for the same data: the left sidebar form fields, AND inline-editable `<input class="ie">` fields embedded directly inside the rendered document text (e.g. inside paragraph copy on the TOR/memo pages). Both write to the same `data` object but this dual-entry-point pattern is a likely source of the "editing documents" confusion/bugs the user hit. Recommend picking one editing model — most likely: sidebar-only editing, with the documents becoming pure read-only output — and dropping the inline `<input>`-in-paragraph pattern, unless truly free-form inline editing is a hard requirement (in which case make it the *only* input path and remove the duplicate sidebar fields for those values).

## Screens / Views
Single screen, three regions:

### 1. Top header bar (`background:#15293f`, height 60px)
- Left: crest badge ("กท" in a gold-bordered square, `#c79a3a` border) + app title (14px/700, white) + subtitle (10.5px, `#9fb1c6`) showing the legal reference and current project name.
- "📁 โครงการ" (Projects) button — opens a project save/load modal.
- Center-right: 3-way segmented control for procurement category: **จัดซื้อ** (purchase) / **จัดจ้าง** (hire) / **จ้างก่อสร้าง** (construction). Active segment: `background:#1d3a5f`, `color:#fff`; inactive: transparent, `color:#cdd8e4`. Container `background:#0e1d2e`, `border-radius:10px`.
- Right: print-scope `<select>` (ฉบับนี้ / ทั้งชุด 13 ฉบับ), "✓ ตรวจก่อนพิมพ์" (review before print, `#26456b`), "⬇ Word" export (`#2a527e`), "🖨 พิมพ์ / PDF" (`#c79a3a` gold, bold, dark text).

### 2. Left sidebar — data entry form (370px fixed width, white bg, scrollable)
Grouped into collapsible-by-relevance sections (each toggled visible/hidden depending on which document is active + a "filter" toggle): ข้อมูลหน่วยงาน (org), ข้อมูลโครงการ (project), วงเงิน (amount), คู่สัญญา (vendor), คณะกรรมการกำหนดราคากลาง (price committee — repeating rows), คณะกรรมการตรวจรับพัสดุ (inspectors — repeating rows), ผู้ลงนาม (signers), รายการ/ราคาอ้างอิง (line items — repeating rows, qty × unit price auto-computed), เลขที่/วันที่ รายฉบับ (per-document reference number + date, 7 documents that carry official numbers), วันที่สำคัญ (key dates).
- Top pinned callout (`background:#fff7e9`, gold border): "★ ข้อมูลที่เปลี่ยนทุกครั้ง" (fields that change every time) — the objective/purpose textarea.
- Below it: a blue callout (`background:#eef4fb`) showing which document is currently being edited, with a "เฉพาะฉบับนี้ / แสดงทุกช่อง" toggle button to filter the form down to only the fields relevant to the active document.
- Garuda emblem upload rows (small 1.5cm for memos, large 3cm for announcements/orders) with upload/remove buttons.
- Repeating-row groups (committee/inspectors/items) each have a bordered card per row with a "ลบ" (remove) button, and an "+ เพิ่ม…" (add) dashed button below the list.
- Field style: label caption 12px/600 `#3a4654`, input/textarea 13px, border `#c5cdd6`, radius 8px, focus ring `#1d3a5f`.

### 3. Right preview area — document canvas (flex:1, scrollable, `background:#dfe4ea`)
- Sticky top nav: 3 rows grouped by procurement phase (๑ ขอซื้อ/ขอจ้าง — 6 docs, ๒ จัดหา — 4 docs, ๓ ตรวจรับ/จ่าย — 3 docs). Each document is a pill button with a numbered circular badge + label; active pill `background:#1d3a5f`/white text, badge gold; inactive white/gray border.
- Below: one `.pg` div per document, only the active one (or, in print/"all" mode, all checked ones) is `display:block`; others `display:none`. Each `.pg` is a simulated A4 sheet: `width:21cm; min-height:29.7cm; padding:1.5cm 2cm 2cm 3cm; background:#fff`, drop shadow, base font 16pt in Thai government document fonts (`TH Sarabun New` fallback stack), paragraph indent 2.5cm, dotted-underline header fields (ส่วนราชการ/ที่/วันที่/เรื่อง), 3-column signature blocks at the bottom.
- The 13 documents (in order): (1) ขออนุมัติจัดหา, (2) บันทึกแต่งตั้ง กก. กำหนดราคากลาง, (3) รายงานผลราคากลาง, (4) รายละเอียดคุณลักษณะ/TOR, (5) รายงานขอความเห็นชอบ (ข้อ 22), (6) แบบ บก.06/บก.01 ราคากลาง, (7) ใบเสนอราคา, (8) ประกาศผู้ชนะ, (9) ขออนุมัติสั่งซื้อ/จ้าง, (10) ใบสั่งซื้อ/ใบสั่งจ้าง, (11) ใบตรวจรับพัสดุ, (12) รายงานผลตรวจรับ, (13) ขออนุมัติเบิก-จ่าย.
- The preview auto-scales (`zoom`) to fit the available width via a `ResizeObserver`.
- A "ตรวจก่อนพิมพ์" (review) modal lists all 13 documents with checkboxes (include/exclude from the print/export batch), each row showing its assigned document number + date, plus a validation summary calling out missing required fields (org name, project name, amount, vendor) and amount-mismatch warnings (order subtotal+VAT vs. total; line-item sum vs. stated amount).
- A "โครงการ" (Projects) modal lists saved projects (name + category badge), lets the user create new / load / delete / save-as, so a user can maintain multiple procurement cases.

## Interactions & Behavior
- **Category switch** (purchase/hire/construction) changes terminology throughout every document (e.g. "ผู้ขาย" vs "ผู้รับจ้าง", "ใบสั่งซื้อ" vs "ใบสั่งจ้าง", which price-comparison form title applies) via a lookup table (`catInfo()`), not per-document copy — a single toggle should re-derive all noun/verb swaps site-wide.
- **Live document number sequencing**: 7 of the 13 documents carry a real เลขที่/วันที่ government reference number, editable individually per document under "เลขที่ / วันที่ (รายฉบับ)".
- **Auto-calculated fields**: Thai baht-text spellout of the amount (`bahtText()` — full number-to-Thai-words conversion including สตางค์/satang), line-item amount = qty × unit price, running totals.
- **Print / PDF**: "พิมพ์ / PDF" prints only the active document (via browser print, `@page{size:A4;margin:0}`); the print-scope selector + review modal can instead print all checked documents as sequential A4 pages (`break-after:page` per `.pg`).
- **Word export**: "⬇ Word" generates a `.doc` file (MHTML/Word-flavored HTML with Office XML namespaces and `@page Section1` size rules) client-side as a Blob download — it post-processes the same page HTML, rewriting flexbox layouts (signature rows, Garuda header) into table/inline-block equivalents because Word's renderer doesn't support flexbox.
- **Field filter toggle**: sidebar can show only the fields relevant to the currently open document (mapped per-document in a `SEC` table) or all fields at once.
- **Persistence**: current form data, category, Garuda images, print checklist, and saved multi-project list all persist to `localStorage` automatically on change and reload on mount (see Known Issues #1 for why this should change for the Garuda images specifically).
- **Validation warnings**: computed live — missing required fields, and arithmetic mismatches between order subtotal+VAT vs. stated amount, and between summed line items vs. stated amount.
- No loading states (fully client-side/synchronous) and no responsive/mobile behavior — this is a desktop-oriented internal tool built for A4 print output.

## State Management
Recreate as one form-state object plus UI-state:
- `data: {...}` — every field described above (org, district, orgAddr, workGroup, workType, method, legalRef, projectName, qty, deliverDays, warranty, scopeBrief, amount, priceDate, fundSource, orderSubtotal, orderVat, penaltyRate, penaltyMin, vendorName, vendorRep, vendorTaxId, vendorAddr, vendorPhone, orderNo, officer, officerPos, headOfficer, headOfficerPos, financeOfficer, financeOfficerPos, approver, approverOrder, payApprover, announceHeader, payApproverOrder, quoteDate, orderDate, announceDate, inspectDate, deliveryDueDate, objective, engineer, engineerPos) — **rebuild `committee`, `inspectors`, `items` as arrays of objects, not delimited strings**, and `docmeta` as a map of `{[docId]: {no, date}}`.
- `category: 'purchase' | 'hire' | 'construction'`
- `activeDoc: string` (one of the 13 doc ids) — which document is shown/being edited.
- `filterOn: boolean` — sidebar field filter.
- `printScope: 'current' | 'all'`, `printSet: {[docId]: boolean}` — which documents are included when printing/exporting all.
- `showReview`, `showProjects` — modal visibility.
- `garuda`, `garuda2` — small/large emblem image references (rebuild as uploaded file references, not base64 strings — see Known Issue #1).
- `projects: {[id]: {name, category, data, ts}}`, `curProjectId` — saved-project list.
- Derived/computed each render (not stored): category-dependent terminology, baht-text amount, formatted numbers, per-document visibility flags, per-document required-field/consistency warnings, document nav model.

## Design Tokens
- **Colors**: navy `#15293f` (header), `#1d3a5f` (primary/active accents, focus rings), `#0e1d2e` (dark control wells), `#26456b` / `#2a527e` (secondary header buttons), gold accent `#c79a3a` (print button, badges, borders), light blue `#eef4fb`/`#cbdcef` (info callouts), warm cream `#fff7e9`/`#e7cf9c` (priority callout), page background `#dfe4ea`/`#eef1f4`, borders `#d4dae1`/`#c5cdd6`/`#e2e7ee`, text grays `#3a4654`/`#5a6675`/`#7a8794`/`#8a96a3`, error/remove `#f6e6e6` bg / `#b4232a` text, success `#e7f3ec` bg / `#0f5132` text.
- **Typography**: UI chrome uses **Sarabun** (Google Font, weights 400/500/600/700). Rendered documents use the Thai government document font stack: `'TH Sarabun IT๙', 'TH SarabunIT9', 'TH Niramit IT๙', 'TH NiramitIT9', 'TH SarabunPSK', 'TH Sarabun New', 'Sarabun', sans-serif`, base size **16pt**, line-height 1.5, letter-spacing .01em. Document body paragraphs: first-line indent 2.5cm. Header labels use bold 20pt for "ที่/เรื่อง/ส่วนราชการ" prefixes.
- **Spacing/sizing**: A4 page `21cm × 29.7cm`, page padding `1.5cm 2cm 2cm 3cm`. Sidebar 370px. Header 60px. Garuda emblem: small 1.5cm, large 3cm. Border radius: 7–10px on buttons/cards/inputs.
- **Shadows**: page card `0 6px 26px rgba(0,0,0,.16)`; header `0 2px 10px rgba(0,0,0,.25)`.

## Assets
- Google Font: Sarabun (400/500/600/700), loaded via `fonts.googleapis.com`.
- Thai government document fonts (TH SarabunIT9/TH Niramit/TH SarabunPSK/TH Sarabun New) are assumed to be installed locally/at the OS or Word level — not web-embedded; there is a CSS fallback stack.
- Garuda (ครุฑ) emblem images are **user-uploaded at runtime** (small 1.5cm version for memos, large 3cm version for announcements/orders) — no bundled emblem asset ships with the tool; the target implementation needs a real upload/asset-storage flow for these, matching Known Issue #1.
- No other external images/icons; buttons use emoji glyphs (📁 ✓ ⬇ 🖨) directly as text.

## Files
- `ระบบจัดการเอกสารจัดซื้อจัดจ้าง.dc.html` — the full working prototype (all markup + logic in one file). This is the authoritative reference for exact copy, layout, and behavior described above.
