import { DOC_LIST } from './docs';
import type { DocId } from '../types';
import { offerFileDownload, type OfferResult } from './fileOffer';

/**
 * Exports the rendered document pages as a Word-flavored HTML (.doc) blob.
 *
 * Word's renderer doesn't support flexbox, so this rewrites the flex layouts used for
 * signature rows and the Garuda letterhead into table/inline-block equivalents — same
 * approach as the prototype, just scoped to a container ref instead of a global DOM query.
 */
export async function downloadWordDoc(
  container: HTMLElement,
  printSet: Partial<Record<DocId, boolean>>,
  filename: string,
): Promise<OfferResult> {
  const parts: string[] = [];

  DOC_LIST.forEach((d) => {
    if (printSet[d.id] === false) return;
    const pg = container.querySelector(`[data-doc-id="${d.id}"]`);
    if (!pg) return;
    let inner = pg.innerHTML;

    // Word ไม่รองรับ flexbox — แปลงเป็น block/inline-block ให้ลงนามเรียงข้างกัน
    inner = inner.replace(/display:\s*flex;\s*justify-content:\s*space-between;\s*gap:\s*16px/g, 'display:block;font-size:0;text-align:center');
    inner = inner.replace(/display:\s*flex;\s*flex-wrap:\s*wrap;\s*justify-content:\s*space-around[^"]*/g, 'display:block;font-size:0;text-align:center');
    inner = inner.replace(/display:\s*flex;\s*justify-content:\s*center/g, 'display:block;text-align:center');
    inner = inner.replace(/display:\s*flex;\s*justify-content:\s*flex-end/g, 'display:block;text-align:right');
    // ลูก (กล่องลงนาม) ให้เป็น inline-block คืนขนาดตัวอักษร
    inner = inner.replace(/text-align:\s*center;\s*width:\s*48%/g, 'display:inline-block;vertical-align:top;font-size:16pt;text-align:center;width:47%');
    inner = inner.replace(/text-align:\s*center;\s*width:\s*(9|8\.5|8|10)cm/g, 'display:inline-block;font-size:16pt;text-align:center;width:$1cm');
    // หัวบันทึกข้อความ: แปลง flex เป็นตารางให้ครุฑกับชื่อเรื่องเรียงแนวเดียวกัน
    inner = inner.replace(/display:\s*flex;\s*align-items:\s*flex-start;\s*gap:\s*14px/g, 'display:table;width:100%;table-layout:fixed');
    inner = inner.replace(/flex:\s*1(\s*1\s*0%)?;\s*text-align:\s*center;\s*padding-top:\s*8px/g, 'display:table-cell;text-align:center;vertical-align:middle');
    inner = inner.replace(
      /(width:\s*1\.5cm;\s*height:\s*1\.5cm;)\s*flex-shrink:\s*0;\s*display:\s*flex;\s*align-items:\s*center;\s*justify-content:\s*center/g,
      'display:table-cell;$1text-align:center;vertical-align:top',
    );
    inner = inner.replace(/width:\s*1\.5cm;\s*flex-shrink:\s*0;/g, 'display:table-cell;width:1.5cm;');

    parts.push(`<div class="Section1 pg">${inner}</div>`);
  });

  const body = parts.join('');
  const css =
    '@page Section1{size:21.0cm 29.7cm;mso-page-orientation:portrait;margin:1.5cm 2.0cm 2.0cm 3.0cm}' +
    'div.Section1{page:Section1}' +
    "body{font-family:'TH SarabunIT9','TH Sarabun New','TH SarabunPSK','Sarabun',sans-serif;font-size:16pt;line-height:1.4;color:#000}" +
    '.pg{font-size:16pt;line-height:1.5}' +
    '.doc-body p{margin:0 0 7pt 0;text-indent:2.5cm;text-align:left}' +
    '.doc-body p.ni{text-indent:0}' +
    '.dot{border-bottom:1px dotted #000;padding-bottom:1px;margin-bottom:2px}' +
    '.dot b,.pg .dot b{font-size:20pt}' +
    '.sig3{margin-top:30pt}' +
    '.sig3>div{display:inline-block;width:32%;text-align:center;vertical-align:top;font-size:16pt}' +
    '.tbl{width:100%;border-collapse:collapse;font-size:14pt;margin:6pt 0 12pt 0}' +
    '.tbl th,.tbl td{border:1px solid #000;padding:4px 7px}' +
    '.g-sm{height:1.5cm;width:auto}.g-lg{height:3cm;width:auto}' +
    'table{border-collapse:collapse}td,th{padding:3px 6px}';
  const html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>เอกสารจัดซื้อจัดจ้าง</title>' +
    '<xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>' +
    `<style>${css}</style></head><body>${body}</body></html>`;

  const blob = new Blob(['﻿' + html], { type: 'application/msword' });
  // .doc opens straight into Word on a normal desktop; .html is the fallback candidate
  // for the Claude downloads capability, which doesn't allow .doc — same HTML content either way.
  return offerFileDownload([
    { filename: `${filename}.doc`, data: blob },
    { filename: `${filename}.html`, data: blob },
  ]);
}
