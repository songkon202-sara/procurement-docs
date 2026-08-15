import { SigColumn } from './common';
import type { DocProps } from './types';

export function Doc11Inspect({ data, vm, display }: DocProps) {
  return (
    <div className="pg" data-doc-id="inspect" style={{ display }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: '19pt', fontWeight: 700 }}>ใบตรวจรับพัสดุ</div>
        <div style={{ fontSize: '14pt' }}>(ตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 ข้อ 175)</div>
      </div>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>วันที่ {data.inspectDate}</div>
      <div className="doc-body">
        <p>
          ตามใบสั่งซื้อ/สั่งจ้าง เลขที่ {data.orderNo} ลงวันที่ {data.orderDate} {vm.orgFull} ได้ตกลง{vm.projectFull} กับ{' '}
          {data.vendorName} สำหรับการ{vm.projectFull} เป็นจำนวนเงินทั้งสิ้น {vm.amountDash} บาท ({vm.amountText})
        </p>
        <p className="ni">คณะกรรมการตรวจรับพัสดุ ได้ตรวจรับพัสดุ แล้วปรากฏว่า</p>
      </div>
      <div style={{ margin: '4px 0 4px 1cm', lineHeight: 1.95 }}>
        <div>1. ผลการตรวจรับ</div>
        <div style={{ marginLeft: '1cm' }}>☐ ถูกต้อง</div>
        <div style={{ marginLeft: '2cm' }}>☐ ครบถ้วนถูกต้องตามสัญญา</div>
        <div style={{ marginLeft: '2cm' }}>☐ ไม่ครบถ้วนตามสัญญา</div>
        <div>2. ค่าปรับ</div>
        <div style={{ marginLeft: '2cm' }}>☐ มีค่าปรับ &nbsp;&nbsp;&nbsp; ☐ ไม่มีค่าปรับ</div>
        <div>3. การเบิกจ่ายเงิน</div>
        <div style={{ marginLeft: '1cm' }}>เบิกจ่ายเงิน เป็นจำนวนเงินทั้งสิ้น {vm.amountFmt} บาท</div>
      </div>
      <SigColumn people={data.inspectors} posPrefix />
    </div>
  );
}
