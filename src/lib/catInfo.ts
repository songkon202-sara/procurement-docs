import type { Category } from '../types';

export interface CatInfo {
  label: string;
  actNoun: string;
  party: string;
  order: string;
  orderVerb: string;
  /** Used as a standalone heading, e.g. the TOR (Doc04Tor) page title. */
  specTitle: string;
  /** Used inline mid-sentence, e.g. "...จัดทำ{specBody} ราคากลาง..." in Doc02Memo/Doc03PriceReport. */
  specBody: string;
  priceForm: string;
  priceTitle: string;
  orderTitle: string;
}

const CAT_INFO: Record<Category, CatInfo> = {
  purchase: {
    label: 'จัดซื้อ',
    actNoun: 'จัดซื้อ',
    party: 'ผู้ขาย',
    order: 'ใบสั่งซื้อ',
    orderVerb: 'สั่งซื้อ',
    specTitle: 'รายละเอียดคุณลักษณะเฉพาะของพัสดุ',
    specBody: 'รายละเอียดคุณลักษณะเฉพาะของพัสดุ',
    priceForm: 'แบบ บก.06',
    priceTitle: 'ตารางแสดงวงเงินงบประมาณที่ได้รับจัดสรรและราคากลาง (ราคาอ้างอิง) ในการจัดซื้อจัดจ้างที่มิใช่งานก่อสร้าง',
    orderTitle: 'ใบสั่งซื้อ',
  },
  hire: {
    label: 'จัดจ้าง',
    actNoun: 'จัดจ้าง',
    party: 'ผู้รับจ้าง',
    order: 'ใบสั่งจ้าง',
    orderVerb: 'สั่งจ้าง',
    // TOR title: "รายละเอียดรูปแบบรายการของพัสดุ" (doc4.docx). Memo/report body: "รูปแบบรายการของพัสดุ" (doc5.docx).
    specTitle: 'รายละเอียดรูปแบบรายการของพัสดุ',
    specBody: 'รูปแบบรายการของพัสดุ',
    priceForm: 'แบบ บก.06',
    priceTitle: 'ตารางแสดงวงเงินงบประมาณที่ได้รับจัดสรรและราคากลาง (ราคาอ้างอิง) ในการจัดซื้อจัดจ้างที่มิใช่งานก่อสร้าง',
    orderTitle: 'ใบสั่งจ้าง',
  },
  construction: {
    label: 'จ้างก่อสร้าง',
    actNoun: 'จ้างก่อสร้าง',
    party: 'ผู้รับจ้าง',
    order: 'สัญญาจ้าง/ใบสั่งจ้าง',
    orderVerb: 'สั่งจ้าง',
    specTitle: 'รายละเอียดรูปแบบรายการของพัสดุ',
    specBody: 'รายละเอียดรูปแบบรายการของพัสดุ',
    priceForm: 'แบบ บก.01',
    priceTitle: 'ตารางแสดงวงเงินงบประมาณที่ได้รับจัดสรรและราคากลางในงานจ้างก่อสร้าง',
    orderTitle: 'ใบสั่งจ้าง',
  },
};

export function catInfo(category: Category): CatInfo {
  return CAT_INFO[category] ?? CAT_INFO.hire;
}
