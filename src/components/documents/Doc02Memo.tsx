import { LetterheadMeta, MemoHeader, PersonRows, SignHeadPair, SignSingle } from './common';
import type { DocProps } from './types';

export function Doc02Memo({ data, vm, garudaUrl, display }: DocProps) {
  const meta = data.docmeta.memo;
  const meta1 = data.docmeta.approveReq;
  return (
    <div className="pg" data-doc-id="memo" style={{ display }}>
      <MemoHeader garudaUrl={garudaUrl} />
      <LetterheadMeta
        orgFull={vm.orgFull}
        no={meta.no}
        date={meta.date}
        subject={`ขออนุมัติแต่งตั้งคณะกรรมการจัดทำ${vm.cat.spec} ราคากลางและหลักเกณฑ์การพิจารณาคัดเลือกข้อเสนอ ${vm.projectFull}`}
      />
      <div className="doc-body">
        <p className="ni">
          <b>เรียน</b> {data.approver} ({data.approverOrder})
        </p>
        <p>
          ตามบันทึกข้อความ{data.org} ที่ {meta1.no} ลงวันที่ {meta1.date} ได้อนุมัติแผนเงินบำรุงหน่วยบริการ {data.org}
        </p>
        <p>
          ในการนี้ {data.workGroup} มีความประสงค์จะ{vm.projectFull} เพื่อ {data.objective} และให้เป็นไปตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ
          พ.ศ. 2560 ข้อ 21 ควรจัดทำ{vm.cat.spec} สำหรับ {vm.projectFull} และขอแต่งตั้งเจ้าหน้าที่จัดทำ{vm.cat.spec}ใช้สำหรับการดำเนินการจัดซื้อ/จัดจ้าง
          ดังกล่าว ดังนี้
        </p>
      </div>
      <PersonRows people={data.committee} margin="6px 0 8px 1.5cm" nameFlex={1.5} posFlex={2.1} />
      <div className="doc-body">
        <p>
          โดยให้มีหน้าที่จัดทำ{vm.cat.spec} ราคากลางและหลักเกณฑ์การพิจารณาคัดเลือกข้อเสนอ{vm.projectFull} โดยกำหนดรายละเอียด
          เป็นไปตามกฎหมาย ระเบียบ และคำสั่งที่เกี่ยวข้อง และให้ใช้บันทึกนี้แทนคำสั่งแต่งตั้งเจ้าหน้าที่จัดทำรายละเอียดคุณลักษณะเฉพาะของพัสดุ
        </p>
        <p>จึงเรียนมาเพื่อโปรดพิจารณา</p>
      </div>
      <SignSingle marginTop={24} name={data.officer} pos={data.officerPos} roleLabel="ทำหน้าที่เจ้าหน้าที่" />
      <SignHeadPair
        marginTop={18}
        approver={data.approver}
        leftNote="- เพื่อโปรดพิจารณา"
        headOfficer={data.headOfficer}
        headOfficerPos={data.headOfficerPos}
        rightLabel="ทราบ/อนุมัติ"
      />
    </div>
  );
}
