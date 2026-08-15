import type { DocProps } from './types';

export function Doc07Quote({ data, vm, display }: DocProps) {
  return (
    <div className="pg" data-doc-id="quote" style={{ display }}>
      <div style={{ textAlign: 'center', fontSize: '19pt', fontWeight: 700, marginBottom: 12 }}>ใบเสนอราคา</div>
      <div style={{ marginBottom: 8 }}>เรียน หัวหน้าเจ้าหน้าที่</div>
      <div className="doc-body">
        <p className="ni" style={{ textIndent: '1cm' }}>
          1. ร้าน/หจก./บริษัท {data.vendorName} อยู่ {data.vendorAddr} โทรศัพท์ {data.vendorPhone} เลขประจำตัวผู้เสียภาษี{' '}
          {data.vendorTaxId} ข้าพเจ้าเป็นผู้มีคุณสมบัติครบถ้วนตามที่กำหนด และไม่เป็นผู้ทิ้งงานของทางราชการ
        </p>
        <p className="ni" style={{ textIndent: '1cm' }}>
          2. {data.vendorName} ขอเสนอพัสดุ รวมทั้งบริการและกำหนดเวลาส่งมอบ ดังต่อไปนี้
        </p>
      </div>
      <table className="tbl">
        <thead>
          <tr style={{ background: '#eef1f4' }}>
            <th style={{ width: '1.2cm' }}>ที่</th>
            <th>รายละเอียดพัสดุที่จะขอซื้อ/จ้าง</th>
            <th style={{ width: '2.4cm' }}>จำนวนหน่วย</th>
            <th style={{ width: '2.6cm' }}>ราคาต่อหน่วย</th>
            <th style={{ width: '3cm' }}>จำนวนเงินที่ขอซื้อ/จ้าง</th>
          </tr>
        </thead>
        <tbody>
          {vm.itemRows.map((it) => (
            <tr key={it.no}>
              <td style={{ textAlign: 'center' }}>{it.no}</td>
              <td>{it.name}</td>
              <td style={{ textAlign: 'center' }}>{it.qtyUnit}</td>
              <td style={{ textAlign: 'right' }}>{it.price}</td>
              <td style={{ textAlign: 'right' }}>{it.amount}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700, background: '#f6f8fa' }}>
            <td colSpan={4}>รวมเป็นเงินทั้งสิ้น &nbsp; ({vm.amountText})</td>
            <td style={{ textAlign: 'right' }}>{vm.itemsTotalFmt}</td>
          </tr>
        </tbody>
      </table>
      <div className="doc-body">
        <p className="ni">ซึ่งเป็นราคาที่รวมภาษีมูลค่าเพิ่ม รวมทั้งภาษีอากรอื่น และค่าใช้จ่ายทั้งปวงไว้ด้วยแล้ว</p>
        <p className="ni" style={{ textIndent: '1cm' }}>
          3. คำเสนอนี้จะยืนอยู่ในระยะเวลา 7 วัน นับตั้งแต่วันที่ยื่นใบเสนอราคา
        </p>
        <p className="ni" style={{ textIndent: '1cm' }}>
          4. กำหนดส่งมอบพัสดุตามรายละเอียดรายการข้างต้น ภายใน {data.deliverDays} วัน นับถัดจากวันลงนาม{vm.cat.order}
        </p>
        <p className="ni" style={{ textIndent: '1cm' }}>
          เสนอมา ณ วันที่ {data.quoteDate}
        </p>
      </div>
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', width: '9cm' }}>
          <div>(ลงชื่อ) .............................................. ผู้เสนอราคา</div>
          <div>( {data.vendorRep} )</div>
          <div>ประทับตรา (ถ้ามี)</div>
        </div>
      </div>
    </div>
  );
}
