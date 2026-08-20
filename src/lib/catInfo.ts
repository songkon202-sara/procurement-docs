import type { Category } from '../types';

export interface CatInfo {
  label: string;
  actNoun: string;
  party: string;
  order: string;
  orderVerb: string;
  spec: string;
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
    spec: 'รายละเอียดคุณลักษณะเฉพาะของพัสดุ',
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
    spec: 'รายละเอียดคุณลักษณะเฉพาะของพัสดุ',
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
    spec: 'รายละเอียดรูปแบบรายการของพัสดุ',
    priceForm: 'แบบ บก.01',
    priceTitle: 'ตารางแสดงวงเงินงบประมาณที่ได้รับจัดสรรและราคากลางในงานจ้างก่อสร้าง',
    orderTitle: 'ใบสั่งจ้าง',
  },
};

export function catInfo(category: Category): CatInfo {
  return CAT_INFO[category] ?? CAT_INFO.hire;
}
