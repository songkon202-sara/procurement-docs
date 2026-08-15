import type { DocId, DocMeta, MeteredDocId, ProcurementData } from '../types';

export interface DocDef {
  id: DocId;
  no: number;
  label: string;
}

/** The 13 documents, in canonical numbered order. */
export const DOC_LIST: DocDef[] = [
  { id: 'approveReq', no: 1, label: 'ขออนุมัติจัดหา' },
  { id: 'memo', no: 2, label: 'แต่งตั้ง กก.ราคากลาง' },
  { id: 'priceReport', no: 3, label: 'รายงานผลราคากลาง' },
  { id: 'tor', no: 4, label: 'รายละเอียดพัสดุ/TOR' },
  { id: 'report', no: 5, label: 'รายงานขอความเห็นชอบ' },
  { id: 'price', no: 6, label: 'ราคากลาง (บก.)' },
  { id: 'quote', no: 7, label: 'ใบเสนอราคา' },
  { id: 'announce', no: 8, label: 'ประกาศผู้ชนะ' },
  { id: 'approve', no: 9, label: 'ขออนุมัติสั่งซื้อ/จ้าง' },
  { id: 'order', no: 10, label: 'ใบสั่งซื้อ/ใบสั่งจ้าง' },
  { id: 'inspect', no: 11, label: 'ใบตรวจรับพัสดุ' },
  { id: 'inspectReport', no: 12, label: 'รายงานผลตรวจรับ' },
  { id: 'payReq', no: 13, label: 'ขออนุมัติเบิก-จ่าย' },
];

export const DOC_PHASES: { name: string; items: DocDef[] }[] = [
  { name: '๑ ขอซื้อ/ขอจ้าง', items: DOC_LIST.slice(0, 6) },
  { name: '๒ จัดหา', items: DOC_LIST.slice(6, 10) },
  { name: '๓ ตรวจรับ/จ่าย', items: DOC_LIST.slice(10, 13) },
];

export type SectionKey =
  | 'org'
  | 'project'
  | 'amount'
  | 'vendor'
  | 'committee'
  | 'inspectors'
  | 'signers'
  | 'items'
  | 'meta'
  | 'dates';

/** Which sidebar sections are relevant to each document — drives the "เฉพาะฉบับนี้" field filter. */
export const SEC: Record<DocId, SectionKey[]> = {
  approveReq: ['org', 'project', 'signers', 'meta'],
  memo: ['org', 'project', 'committee', 'signers', 'meta'],
  priceReport: ['org', 'project', 'amount', 'committee', 'signers', 'meta'],
  tor: ['org', 'project', 'amount', 'committee'],
  report: ['org', 'project', 'amount', 'inspectors', 'signers', 'meta'],
  price: ['org', 'project', 'amount', 'vendor', 'committee', 'items'],
  quote: ['project', 'vendor', 'amount', 'items', 'dates'],
  announce: ['org', 'project', 'vendor', 'amount', 'signers', 'dates'],
  approve: ['org', 'project', 'amount', 'vendor', 'signers', 'meta'],
  order: ['org', 'project', 'vendor', 'amount', 'items', 'dates'],
  inspect: ['org', 'project', 'vendor', 'amount', 'inspectors', 'dates'],
  inspectReport: ['org', 'project', 'vendor', 'inspectors', 'signers', 'dates', 'meta'],
  payReq: ['org', 'project', 'vendor', 'amount', 'signers', 'meta'],
};

/** The 7 documents that carry a real government เลขที่/วันที่ reference number, in date/number order. */
export const METERED_DOCS: { key: MeteredDocId; label: string }[] = [
  { key: 'approveReq', label: '1. ขออนุมัติจัดหา' },
  { key: 'memo', label: '2. แต่งตั้ง กก.ราคากลาง' },
  { key: 'priceReport', label: '3. รายงานผลราคากลาง' },
  { key: 'report', label: '5. รายงานขอความเห็นชอบ' },
  { key: 'approve', label: '9. ขออนุมัติสั่งซื้อ/จ้าง' },
  { key: 'inspectReport', label: '12. รายงานผลตรวจรับ' },
  { key: 'payReq', label: '13. ขออนุมัติเบิก-จ่าย' },
];

const METERED_IDS = new Set<DocId>(METERED_DOCS.map((m) => m.key));

/** Looks up a document's official เลขที่/วันที่ — undefined for the 6 docs that don't carry one. */
export function getDocMeta(data: ProcurementData, id: DocId): DocMeta | undefined {
  return METERED_IDS.has(id) ? data.docmeta[id as MeteredDocId] : undefined;
}
