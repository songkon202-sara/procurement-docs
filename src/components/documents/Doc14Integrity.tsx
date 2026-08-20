import { SigColumn } from './common';
import type { DocProps } from './types';
import type { PersonRow } from '../../types';

export function Doc14Integrity({ data, vm, display }: DocProps) {
  const signers: PersonRow[] = [
    { id: 'headOfficer', name: data.headOfficer, pos: data.headOfficerPos, role: 'หัวหน้าเจ้าหน้าที่' },
    { id: 'officer', name: data.officer, pos: data.officerPos, role: 'เจ้าหน้าที่' },
    ...data.inspectors,
  ];

  return (
    <div className="pg" data-doc-id="integrity" style={{ display }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: '16pt', fontWeight: 700 }}>แบบแสดงความบริสุทธิ์ใจในการจัดซื้อจัดจ้างทุกวิธีของหน่วยงาน</div>
        <div style={{ fontWeight: 700 }}>ในการเปิดเผยข้อมูลความขัดแย้งทางผลประโยชน์</div>
        <div style={{ fontWeight: 700 }}>ของหัวหน้าเจ้าหน้าที่ เจ้าหน้าที่ และคณะกรรมการตรวจรับพัสดุ</div>
        <div>{vm.orgFull}</div>
      </div>
      <div className="doc-body">
        <p className="ni">
          รายการจัดหา: {vm.projectFull} วงเงิน {vm.amountFmt} บาท แหล่งเงิน: {data.fundSource}
        </p>
        {signers.map((m) => (
          <p className="ni" key={m.id}>
            ข้าพเจ้า {m.name} ({m.role})
          </p>
        ))}
        <p>
          ขอให้คำรับรองว่าไม่มีความเกี่ยวข้องหรือมีส่วนได้ส่วนเสียไม่ว่าโดยตรงหรือโดยอ้อม หรือผลประโยชน์ใด ๆ
          ที่ก่อให้เกิดความขัดแย้งทางผลประโยชน์กับผู้ขาย ผู้รับจ้าง ผู้เสนองาน หรือผู้ชนะประมูล
          หรือผู้มีส่วนเกี่ยวข้องที่เข้ามามีนิติสัมพันธ์ และวางตัวเป็นกลางในการดำเนินการเกี่ยวกับการพัสดุ
          ปฏิบัติหน้าที่ด้วยจิตสำนึก ด้วยความโปร่งใส สามารถให้มีผู้เกี่ยวข้องตรวจสอบได้ทุกเวลา มุ่งประโยชน์ส่วนรวมเป็นสำคัญ
          ตามที่ระบุไว้ในประกาศสำนักงานปลัดกระทรวงสาธารณสุขว่าด้วยแนวทางปฏิบัติงานเพื่อตรวจสอบบุคลากรในหน่วยงานด้านการจัดซื้อจัดจ้าง
          พ.ศ. 2560
        </p>
        <p>
          หากปรากฏว่าเกิดความขัดแย้งทางผลประโยชน์ระหว่างข้าพเจ้ากับผู้ขาย ผู้รับจ้าง ผู้เสนองาน หรือผู้ชนะประมูล
          หรือผู้มีส่วนเกี่ยวข้องที่เข้ามามีนิติสัมพันธ์ ข้าพเจ้าจะรายงานให้ทราบโดยทันที
        </p>
      </div>
      <SigColumn people={signers} posPrefix />
    </div>
  );
}
