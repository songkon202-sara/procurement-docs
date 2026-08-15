import { GarudaBox } from './common';
import type { DocProps } from './types';

export function Doc08Announce({ data, vm, garudaLargeUrl, display }: DocProps) {
  return (
    <div className="pg" data-doc-id="announce" style={{ display }}>
      <div style={{ textAlign: 'center', marginBottom: 6, display: 'flex', justifyContent: 'center' }}>
        <GarudaBox url={garudaLargeUrl} size="3cm" variant="lg" />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '18pt', fontWeight: 700 }}>ประกาศ{data.announceHeader}</div>
        <div style={{ fontSize: '17pt', fontWeight: 700 }}>เรื่อง ประกาศผู้ชนะการเสนอราคา {vm.projectFull}</div>
        <div style={{ letterSpacing: '2px', margin: '2px 0 12px' }}>--------------------------------------------</div>
      </div>
      <div className="doc-body">
        <p>
          ตามที่ {data.org} {data.district} ได้ตกลงจัดซื้อ/จัดจ้าง {vm.projectFull} นั้น
        </p>
        <p>
          ผู้ได้รับการคัดเลือก ได้แก่ {data.vendorName} โดยเสนอราคา เป็นเงินทั้งสิ้น {vm.amountDash} บาท ({vm.amountText})
          รวมภาษีมูลค่าเพิ่มและภาษีอื่น ค่าขนส่ง ค่าจดทะเบียน และค่าใช้จ่ายอื่น ๆ ทั้งปวง
        </p>
        <p style={{ textIndent: '4cm' }}>ประกาศ ณ วันที่ {data.announceDate}</p>
      </div>
      <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', width: '10cm' }}>
          <div>( {data.headOfficer} )</div>
          <div>{data.headOfficerPos}</div>
          <div>ปฏิบัติราชการแทน {data.approver}</div>
        </div>
      </div>
    </div>
  );
}
