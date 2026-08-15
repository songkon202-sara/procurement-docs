import { GarudaBox } from './common';
import type { DocProps } from './types';

export function Doc10Order({ data, vm, garudaLargeUrl, display }: DocProps) {
  return (
    <div className="pg" data-doc-id="order" style={{ display }}>
      <div style={{ textAlign: 'center', marginBottom: 2, display: 'flex', justifyContent: 'center' }}>
        <GarudaBox url={garudaLargeUrl} size="2cm" variant="lg" />
      </div>
      <div style={{ textAlign: 'center', fontSize: '19pt', fontWeight: 700, marginBottom: 8 }}>{vm.cat.orderTitle}</div>
      <div style={{ display: 'flex', gap: 20, fontSize: '15pt', lineHeight: 1.7 }}>
        <div style={{ flex: 1 }}>
          <div className="dot">ผู้ขาย/รับจ้าง {data.vendorName}</div>
          <div className="dot">ที่อยู่ {data.vendorAddr}</div>
          <div className="dot">โทรศัพท์ {data.vendorPhone}</div>
          <div className="dot">เลขประจำตัวผู้เสียภาษี {data.vendorTaxId}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="dot">
            {vm.cat.order}เลขที่ {data.orderNo}
          </div>
          <div className="dot">วันที่ {data.orderDate}</div>
          <div className="dot">ส่วนราชการ {data.org}</div>
          <div className="dot">{data.district}</div>
        </div>
      </div>
      <div className="doc-body" style={{ marginTop: 8 }}>
        <p className="ni">
          ตามที่ {data.vendorName} ได้เสนอราคาไว้ต่อ {data.org} ซึ่งได้รับราคาและตกลงซื้อ/จ้าง ตามรายการดังต่อไปนี้
        </p>
      </div>
      <table className="tbl">
        <thead>
          <tr style={{ background: '#eef1f4' }}>
            <th style={{ width: '1.6cm' }}>ลำดับ</th>
            <th>รายการ</th>
            <th style={{ width: '2cm' }}>จำนวน</th>
            <th style={{ width: '1.8cm' }}>หน่วย</th>
            <th style={{ width: '2.6cm' }}>ราคาต่อหน่วย (บาท)</th>
            <th style={{ width: '2.8cm' }}>จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {vm.itemRows.map((it) => (
            <tr key={it.no}>
              <td style={{ textAlign: 'center' }}>{it.no}</td>
              <td>{it.name}</td>
              <td style={{ textAlign: 'center' }}>{it.qty}</td>
              <td style={{ textAlign: 'center' }}>{it.unit}</td>
              <td style={{ textAlign: 'right' }}>{it.price}</td>
              <td style={{ textAlign: 'right' }}>{it.amount}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={4} rowSpan={3} style={{ textAlign: 'center', verticalAlign: 'bottom' }}>
              ({vm.amountText})
            </td>
            <td style={{ textAlign: 'right' }}>รวมเป็นเงิน</td>
            <td style={{ textAlign: 'right' }}>{vm.orderSubtotalFmt}</td>
          </tr>
          <tr>
            <td style={{ textAlign: 'right' }}>ภาษีมูลค่าเพิ่ม</td>
            <td style={{ textAlign: 'right' }}>{vm.orderVatFmt}</td>
          </tr>
          <tr style={{ fontWeight: 700 }}>
            <td style={{ textAlign: 'right' }}>รวมเป็นเงินทั้งสิ้น</td>
            <td style={{ textAlign: 'right' }}>{vm.amountFmt}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>การสั่งซื้อ/สั่งจ้าง อยู่ภายใต้เงื่อนไขต่อไปนี้</div>
        <div>
          1. กำหนดส่งมอบภายใน {data.deliverDays} วัน นับถัดจากวันที่{vm.cat.party}ได้รับ{vm.cat.order}
        </div>
        <div>2. ครบกำหนดส่งมอบวันที่ {data.deliveryDueDate}</div>
      </div>
      <div style={{ marginTop: 26, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div>(ลงชื่อ) .............................. ผู้สั่งซื้อ/สั่งจ้าง</div>
          <div>( {data.headOfficer} )</div>
          <div>{data.headOfficerPos}</div>
        </div>
        <div style={{ textAlign: 'center', width: '48%' }}>
          <div>(ลงชื่อ) .............................. {vm.cat.party}</div>
          <div>( {data.vendorRep} )</div>
          <div>{data.vendorName}</div>
        </div>
      </div>
    </div>
  );
}
