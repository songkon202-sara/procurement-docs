import { LetterheadMeta, MemoHeader, SigColumn } from './common';
import type { DocProps } from './types';

export function Doc03PriceReport({ data, vm, garudaUrl, display }: DocProps) {
  const meta = data.docmeta.priceReport;
  const meta2 = data.docmeta.memo;
  return (
    <div className="pg" data-doc-id="priceReport" style={{ display }}>
      <MemoHeader garudaUrl={garudaUrl} />
      <LetterheadMeta
        orgFull={vm.orgFull}
        no={meta.no}
        date={meta.date}
        subject={`รายงานผลการจัดทำ${vm.cat.spec} ราคากลางและหลักเกณฑ์การพิจารณาคัดเลือกข้อเสนอ สำหรับ ${vm.projectFull}`}
      />
      <div className="doc-body">
        <p className="ni">
          <b>เรียน</b> {data.approver} ({data.approverOrder})
        </p>
        <p>
          ตามบันทึก{data.org} ที่ {meta2.no} ลงวันที่ {meta2.date} ได้แต่งตั้งคณะกรรมการจัดทำ{vm.cat.spec} และราคากลาง{' '}
          {vm.projectFull} วงเงินที่ได้รับจัดสรร {vm.amountDash} บาท ({vm.amountText}) ด้วยเงินบำรุง{data.org}
        </p>
        <p>
          บัดนี้ คณะกรรมการจัดทำ{vm.cat.spec} ราคากลางและหลักเกณฑ์การพิจารณาคัดเลือกข้อเสนอ ได้กำหนดจัดทำ{vm.cat.spec}{' '}
          ราคากลางและหลักเกณฑ์การพิจารณาคัดเลือกข้อเสนอดังกล่าวแล้ว รวมเป็นเงินทั้งสิ้น {vm.amountDash} บาท ({vm.amountText})
          โดยใช้เกณฑ์ราคาในการพิจารณาคัดเลือกข้อเสนอ ดังรายละเอียดที่แนบมาพร้อมบันทึกนี้
        </p>
        <p>
          จึงเรียนมาเพื่อโปรดพิจารณา เห็นควรใช้{vm.cat.spec} ราคากลางและหลักเกณฑ์การพิจารณาคัดเลือกข้อเสนอ
          ดังกล่าวในการดำเนินการจัดซื้อ/จัดจ้างต่อไป
        </p>
      </div>
      <SigColumn people={data.committee} />
    </div>
  );
}
