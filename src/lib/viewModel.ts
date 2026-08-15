import type { Category, ProcurementData } from '../types';
import { catInfo } from './catInfo';
import { bahtText, fmt } from './format';

export interface ItemRow {
  no: number;
  name: string;
  qty: string;
  unit: string;
  qtyUnit: string;
  price: string;
  amount: string;
  rawAmount: number;
}

export interface DocViewModel {
  cat: ReturnType<typeof catInfo>;
  projectFull: string;
  orgFull: string;
  amountFmt: string;
  amountText: string;
  amountDash: string;
  scopeOrRef: string;
  itemRows: ItemRow[];
  itemsTotal: number;
  itemsTotalFmt: string;
  orderSubtotalFmt: string;
  orderVatFmt: string;
  isConstruction: boolean;
}

export function buildViewModel(data: ProcurementData, category: Category): DocViewModel {
  const cat = catInfo(category);
  const projectFull = [data.workType, data.projectName, `จำนวน ${data.qty}`, `โดยวิธี${data.method}`]
    .filter(Boolean)
    .join(' ');
  const amountFmt = fmt(data.amount);
  const amountText = bahtText(data.amount);

  const itemRows: ItemRow[] = data.items.map((it, i) => {
    const qn = Number(String(it.qty).replace(/[, ]/g, '')) || 0;
    const pr = Number(String(it.price).replace(/[, ]/g, '')) || 0;
    const amt = qn * pr;
    return {
      no: i + 1,
      name: it.name,
      qty: it.qty,
      unit: it.unit,
      qtyUnit: `${it.qty} ${it.unit}`,
      price: fmt(pr),
      amount: fmt(amt),
      rawAmount: amt,
    };
  });
  const itemsTotal = itemRows.reduce((s, r) => s + r.rawAmount, 0);

  return {
    cat,
    projectFull,
    orgFull: `${data.org}  ${data.district}`,
    amountFmt,
    amountText,
    amountDash: `${amountFmt}.-`,
    scopeOrRef: data.scopeBrief || 'รายละเอียดตามเอกสารแนบ',
    itemRows,
    itemsTotal,
    itemsTotalFmt: fmt(itemsTotal),
    orderSubtotalFmt: fmt(data.orderSubtotal),
    orderVatFmt: fmt(data.orderVat),
    isConstruction: category === 'construction',
  };
}
