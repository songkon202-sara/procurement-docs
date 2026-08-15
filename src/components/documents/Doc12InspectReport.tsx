import { LetterheadMeta, MemoHeader, PersonRows, SignHeadPair, SignSingle } from './common';
import type { DocProps } from './types';

export function Doc12InspectReport({ data, vm, garudaUrl, display }: DocProps) {
  const meta = data.docmeta.inspectReport;
  const meta5 = data.docmeta.report;
  return (
    <div className="pg" data-doc-id="inspectReport" style={{ display }}>
      <MemoHeader garudaUrl={garudaUrl} />
      <LetterheadMeta orgFull={vm.orgFull} no={meta.no} date={meta.date} subject={`รายงานผลการตรวจรับ ${vm.projectFull}`} />
      <div className="doc-body">
        <p className="ni">
          <b>เรียน</b> {data.approver} ({data.approverOrder})
        </p>
        <p>
          ตามบันทึกข้อความ{data.org} ที่ {meta5.no} วันที่ {meta5.date} ได้แต่งตั้งคณะกรรมการตรวจรับพัสดุ{vm.projectFull} และแต่งตั้งให้
        </p>
      </div>
      <PersonRows people={data.inspectors} margin="2px 0 4px 1.2cm" nameFlex={1.6} posFlex={2.2} gap="3px" />
      <div className="doc-body">
        <p>
          บัดนี้ {data.vendorName} ได้ส่งมอบพัสดุดังกล่าวในวันที่ {data.inspectDate} ซึ่งคณะกรรมการตรวจรับพัสดุ ได้ทำการตรวจรับเป็นการถูกต้อง
          ครบถ้วนตามใบสั่งซื้อ/สั่งจ้าง เลขที่ {data.orderNo} ลงวันที่ {data.orderDate} แล้วเมื่อวันที่ {data.inspectDate}{' '}
          ตามใบส่งของเล่มที่ ......... เลขที่ ......... ลงวันที่ {data.inspectDate} เป็นจำนวนเงิน {vm.amountDash} บาท ({vm.amountText})
          จึงได้ลงนามไว้เป็นหลักฐาน
        </p>
        <p>จึงเรียนมาเพื่อโปรดทราบ ตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 ข้อ 175 (4)</p>
      </div>
      <SignSingle marginTop={20} showSignLine={false} name={data.officer} pos={data.officerPos} roleLabel="ทำหน้าที่เจ้าหน้าที่" />
      <SignHeadPair
        marginTop={16}
        approver={data.approver}
        leftNote="- เพื่อโปรดทราบ"
        headOfficer={data.headOfficer}
        headOfficerPos={data.headOfficerPos}
        rightLabel="ทราบ"
      />
    </div>
  );
}
