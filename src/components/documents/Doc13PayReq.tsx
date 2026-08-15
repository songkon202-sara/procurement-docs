import { LetterheadMeta, MemoHeader, SignSingle } from './common';
import type { DocProps } from './types';

export function Doc13PayReq({ data, vm, garudaUrl, display }: DocProps) {
  const meta = data.docmeta.payReq;
  return (
    <div className="pg" data-doc-id="payReq" style={{ display }}>
      <MemoHeader garudaUrl={garudaUrl} />
      <LetterheadMeta orgFull={vm.orgFull} no={meta.no} date={meta.date} subject="ขออนุมัติเบิก-จ่าย เงินบำรุง" />
      <div className="doc-body">
        <p className="ni">
          <b>เรียน</b> {data.payApprover} ({data.payApproverOrder})
        </p>
        <p>
          {data.workGroup} {data.org} ขอส่งเอกสารเพื่อเบิกจ่ายเงิน ตามที่ {data.org} ได้ {vm.projectFull} กับ {data.vendorName}{' '}
          เป็นเงินทั้งสิ้น {vm.amountDash} บาท ({vm.amountText}) ตามใบสั่งซื้อ/สั่งจ้างเลขที่ {data.orderNo} ลงวันที่ {data.orderDate}{' '}
          ซึ่งได้เป็นราคารวมภาษีมูลค่าเพิ่มแล้ว นั้น
        </p>
        <p>
          บัดนี้ {data.vendorName} ได้ส่งมอบพัสดุ เสร็จเรียบร้อยแล้วและเจ้าหน้าที่ได้ตรวจรับพัสดุไว้เป็นการถูกต้องเรียบร้อยแล้ว
          เห็นควรเบิกจ่ายเงินจำนวน {vm.amountDash} บาท ({vm.amountText}) เพื่อจ่ายให้ {data.vendorName} ต่อไป
        </p>
        <p>ผู้ตรวจรับ/คณะกรรมการตรวจรับได้ตรวจรับของถูกต้องแล้ว</p>
        <p>จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ</p>
      </div>
      <SignSingle align="center" width="9cm" marginTop={24} showSignLine={false} name={data.financeOfficer} pos={data.financeOfficerPos} />
      <div style={{ marginTop: 18, textAlign: 'center', fontWeight: 700 }}>อนุมัติ</div>
      <SignSingle
        align="center"
        width="9cm"
        marginTop={14}
        showSignLine={false}
        name={data.headOfficer}
        pos={data.headOfficerPos}
        roleLabel={`ปฏิบัติราชการแทน ${data.payApprover}`}
      />
    </div>
  );
}
