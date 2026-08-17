export type Category = 'purchase' | 'hire' | 'construction';

export type DocId =
  | 'approveReq'
  | 'memo'
  | 'priceReport'
  | 'tor'
  | 'report'
  | 'price'
  | 'quote'
  | 'announce'
  | 'approve'
  | 'order'
  | 'inspect'
  | 'inspectReport'
  | 'payReq';

/** The 7 document ids that carry an official เลขที่/วันที่ reference number. */
export type MeteredDocId = 'approveReq' | 'memo' | 'priceReport' | 'report' | 'approve' | 'inspectReport' | 'payReq';

export interface PersonRow {
  id: string;
  name: string;
  pos: string;
  role: string;
}

export interface LineItem {
  id: string;
  name: string;
  qty: string;
  unit: string;
  price: string;
}

export interface DocMeta {
  no: string;
  date: string;
}

export interface ProcurementData {
  // ข้อมูลหน่วยงาน
  org: string;
  district: string;
  orgAddr: string;
  workGroup: string;

  // ข้อมูลโครงการ
  workType: string;
  method: string;
  legalRef: string;
  projectName: string;
  qty: string;
  deliverDays: string;
  warranty: string;
  scopeBrief: string;

  // วงเงิน
  amount: string;
  priceDate: string;
  fundSource: string;
  orderSubtotal: string;
  orderVat: string;
  penaltyRate: string;
  penaltyMin: string;

  // คู่สัญญา
  vendorId: string;
  vendorName: string;
  vendorRep: string;
  vendorTaxId: string;
  vendorAddr: string;
  vendorPhone: string;
  orderNo: string;

  // คณะกรรมการ / รายการ
  committee: PersonRow[];
  inspectors: PersonRow[];
  items: LineItem[];

  // ผู้ลงนาม
  officer: string;
  officerPos: string;
  headOfficer: string;
  headOfficerPos: string;
  financeOfficer: string;
  financeOfficerPos: string;
  approver: string;
  approverOrder: string;
  payApprover: string;
  payApproverOrder: string;
  announceHeader: string;

  // ก่อสร้าง
  engineer: string;
  engineerPos: string;

  // วันที่สำคัญ
  quoteDate: string;
  orderDate: string;
  announceDate: string;
  inspectDate: string;
  deliveryDueDate: string;

  // ข้อมูลที่เปลี่ยนทุกครั้ง
  objective: string;

  // เลขที่ / วันที่ รายฉบับ
  docmeta: Record<MeteredDocId, DocMeta>;
}

export interface SavedProject {
  id: string;
  name: string;
  category: Category;
  data: ProcurementData;
  ts: number;
}

export type PrintScope = 'current' | 'all';

/** Mirrors backend/src/domain/workflow.ts's RoleCode. */
export type RoleCode = 'procurement_officer' | 'auditor' | 'approver' | 'admin' | 'viewer';

/** Mirrors backend/src/domain/workflow.ts's CaseStatus. */
export type CaseStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed' | 'cancelled';

export interface AuthUser {
  id: string;
  fullName: string;
  position: string;
  email: string;
  roles: RoleCode[];
}
