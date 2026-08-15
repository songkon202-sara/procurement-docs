import { LetterheadMeta, MemoHeader, SignSingle } from './common';
import type { DocProps } from './types';

export function Doc01ApproveReq({ data, vm, garudaUrl, display }: DocProps) {
  const meta = data.docmeta.approveReq;
  return (
    <div className="pg" data-doc-id="approveReq" style={{ display }}>
      <MemoHeader garudaUrl={garudaUrl} />
      <LetterheadMeta orgFull={vm.orgFull} no={meta.no} date={meta.date} subject={`ขออนุมัติ${vm.projectFull}`} />
      <div className="doc-body">
        <p className="ni">
          <b>เรียน</b> {data.approver} ({data.approverOrder})
        </p>
        <p>
          ด้วย{data.workGroup} {data.org} มีความประสงค์ขอ{vm.projectFull} เพื่อ {data.objective}
        </p>
        <p>
          ในการนี้ {data.workGroup} จึงขออนุมัติ{vm.projectFull} จำนวน 1 ครั้ง และมอบให้ {data.officer} ตำแหน่ง{' '}
          {data.officerPos} ทำหน้าที่เจ้าหน้าที่ ดำเนินการตามพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560
          ต่อไป
        </p>
        <p>จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ</p>
      </div>
      <SignSingle align="center" width="9cm" marginTop={26} name={data.officer} pos={data.officerPos} roleLabel="ทำหน้าที่เจ้าหน้าที่" />
      <div style={{ marginTop: 20, textAlign: 'center', fontWeight: 700 }}>อนุมัติ</div>
      <SignSingle
        align="center"
        width="9cm"
        marginTop={14}
        name={data.headOfficer}
        pos={data.headOfficerPos}
        roleLabel={`ปฏิบัติราชการแทน ${data.approver}`}
      />
    </div>
  );
}
