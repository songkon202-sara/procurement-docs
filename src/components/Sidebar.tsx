import type { ReactNode } from 'react';
import { DOC_LIST, METERED_DOCS, SEC, type SectionKey } from '../lib/docs';
import { useApp } from '../state/store';
import { GarudaUploader } from './sidebar/GarudaUploader';
import { ItemsEditor } from './sidebar/ItemsEditor';
import { PersonRowsEditor } from './sidebar/PersonRowsEditor';
import { VendorPicker } from './sidebar/VendorPicker';
import { Row, TextAreaField, TextField } from './sidebar/fields';
import type { DocViewModel } from '../lib/viewModel';

function Section({ visible, children }: { visible: boolean; children: ReactNode }) {
  return <div style={{ display: visible ? 'block' : 'none' }}>{children}</div>;
}

function MiniButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ border: '1px solid #9db2c8', background: '#f2f6fb', color: '#1d3a5f', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif", whiteSpace: 'nowrap' }}
    >
      {children}
    </button>
  );
}

export function Sidebar({ vm }: { vm: DocViewModel }) {
  const { state, updateField, updateMeta, toggleFilter, uploadGaruda, clearGaruda, uploadGaruda2, clearGaruda2, autoNumberMeta, autoCalcVat, autoCalcDeliveryDue } = useApp();
  const { data, filterOn, activeDoc } = state;

  const activeSecs: SectionKey[] = SEC[activeDoc] ?? [];
  const secVisible = (k: SectionKey) => !filterOn || activeSecs.includes(k);
  const activeLabel = DOC_LIST.find((d) => d.id === activeDoc)?.label ?? '';
  const metaList = filterOn ? METERED_DOCS.filter((m) => m.key === activeDoc) : METERED_DOCS;

  return (
    <aside className="app-chrome panel" style={{ width: 370, flexShrink: 0, background: '#fff', borderRight: '1px solid #d4dae1', overflowY: 'auto', padding: '16px 18px' }}>
      <div style={{ background: '#fff7e9', border: '1px solid #e7cf9c', borderRadius: 10, padding: '12px 12px 4px', marginBottom: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#8a6a1e', marginBottom: 8, letterSpacing: '.03em' }}>★ ข้อมูลที่เปลี่ยนทุกครั้ง</div>
        <div className="hint" style={{ marginTop: 2 }}>
          แก้เลขที่หนังสือและวันที่ของแต่ละฉบับได้ในหัวข้อ “เลขที่ / วันที่ (รายฉบับ)” ด้านล่าง
        </div>
        <TextAreaField label="เหตุผล / วัตถุประสงค์ในการจัดซื้อจัดจ้าง" rows={3} value={data.objective} onChange={(v) => updateField('objective', v)} />
      </div>

      <div style={{ background: '#eef4fb', border: '1px solid #cbdcef', borderRadius: 10, padding: '9px 11px', margin: '8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: '#6b7a8a', fontWeight: 600 }}>กำลังแก้ไขเอกสาร</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1d3a5f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeLabel}</div>
        </div>
        <button
          onClick={toggleFilter}
          style={{ border: '1px solid #1d3a5f', background: '#fff', color: '#1d3a5f', borderRadius: 7, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sarabun',sans-serif", whiteSpace: 'nowrap' }}
        >
          {filterOn ? 'แสดงทุกช่อง' : 'เฉพาะฉบับนี้'}
        </button>
      </div>

      <h3>ตราครุฑ (ตามประเภทหนังสือ)</h3>
      <div className="hint">ครุฑเล็ก ๑.๕ ซม. สำหรับบันทึกข้อความ · ครุฑใหญ่ ๓ ซม. สำหรับประกาศ/ใบสั่ง (ถ้าไม่อัปโหลดครุฑใหญ่ จะใช้ครุฑเล็กแทน)</div>
      <GarudaUploader
        label="ครุฑเล็ก — บันทึกข้อความ"
        placeholderLines={['ครุฑเล็ก', '๑.๕ ซม.']}
        url={state.garudaUrl}
        onUpload={uploadGaruda}
        onClear={clearGaruda}
      />
      <GarudaUploader
        label="ครุฑใหญ่ — ประกาศ / ใบสั่ง"
        placeholderLines={['ครุฑใหญ่', '๓ ซม.']}
        url={state.garuda2Url}
        onUpload={uploadGaruda2}
        onClear={clearGaruda2}
      />

      <Section visible={secVisible('org')}>
        <h3>ข้อมูลหน่วยงาน</h3>
        <TextField label="ชื่อหน่วยงาน (ส่วนราชการ)" value={data.org} onChange={(v) => updateField('org', v)} />
        <TextField label="อำเภอ / จังหวัด / รหัสไปรษณีย์" value={data.district} onChange={(v) => updateField('district', v)} />
        <Row>
          <TextField flex={1.4} label="ที่อยู่หน่วยงาน" value={data.orgAddr} onChange={(v) => updateField('orgAddr', v)} />
          <TextField flex={1} label="กลุ่ม/งานผู้ขอ" value={data.workGroup} onChange={(v) => updateField('workGroup', v)} />
        </Row>
      </Section>

      <Section visible={secVisible('project')}>
        <h3>ข้อมูลโครงการ</h3>
        <Row>
          <TextField flex={1.3} label="ประเภทงาน (คำนำหน้า)" value={data.workType} onChange={(v) => updateField('workType', v)} />
          <TextField flex={1} label="วิธีจัดหา" value={data.method} onChange={(v) => updateField('method', v)} />
        </Row>
        <TextField label="อ้างมาตรา (วิธีจัดหา)" value={data.legalRef} onChange={(v) => updateField('legalRef', v)} />
        <TextAreaField label="ชื่อโครงการ / รายการ" rows={2} value={data.projectName} onChange={(v) => updateField('projectName', v)} />
        <Row>
          <TextField flex={1} label="จำนวน" value={data.qty} onChange={(v) => updateField('qty', v)} />
          <TextField flex={1} label="ส่งมอบภายใน (วัน)" value={data.deliverDays} onChange={(v) => updateField('deliverDays', v)} />
        </Row>
        <TextField label="ระยะรับประกันความชำรุดบกพร่อง" value={data.warranty} onChange={(v) => updateField('warranty', v)} placeholder="เช่น 1 ปี / — ถ้าไม่มี" />
        <TextAreaField label="ลักษณะงานโดยสังเขป (บก.)" rows={2} value={data.scopeBrief} onChange={(v) => updateField('scopeBrief', v)} />
      </Section>

      <Section visible={secVisible('amount')}>
        <h3>วงเงิน</h3>
        <Row>
          <TextField flex={1} label="วงเงิน / ราคากลาง (บาท)" value={data.amount} onChange={(v) => updateField('amount', v)} />
          <TextField flex={1} label="วันที่กำหนดราคากลาง" value={data.priceDate} onChange={(v) => updateField('priceDate', v)} />
        </Row>
        <div style={{ fontSize: 11, color: '#0f5132', background: '#e7f3ec', borderRadius: 7, padding: '6px 9px', marginBottom: 10 }}>ตัวอักษร: {vm.amountText}</div>
        <TextAreaField label="แหล่งเงิน" rows={2} value={data.fundSource} onChange={(v) => updateField('fundSource', v)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0 8px' }}>
          <span className="hint" style={{ margin: 0, flex: 1 }}>ราคาก่อน VAT / VAT ของใบสั่ง (สำหรับเอกสารฉบับที่ 10)</span>
          <MiniButton onClick={autoCalcVat}>คำนวณ VAT 7% อัตโนมัติ</MiniButton>
        </div>
        <Row>
          <TextField flex={1} label="ราคาก่อน VAT (ใบสั่ง)" value={data.orderSubtotal} onChange={(v) => updateField('orderSubtotal', v)} />
          <TextField flex={1} label="ภาษีมูลค่าเพิ่ม (ใบสั่ง)" value={data.orderVat} onChange={(v) => updateField('orderVat', v)} />
        </Row>
        <Row>
          <TextField flex={1} label="อัตราค่าปรับ (ร้อยละ/วัน)" value={data.penaltyRate} onChange={(v) => updateField('penaltyRate', v)} />
          <TextField flex={1} label="ค่าปรับขั้นต่ำ/วัน" value={data.penaltyMin} onChange={(v) => updateField('penaltyMin', v)} />
        </Row>
      </Section>

      <Section visible={secVisible('vendor')}>
        <h3>คู่สัญญา / ผู้เสนอราคา</h3>
        <VendorPicker />
        <Row>
          <TextField flex={1} label="ผู้ลงนาม (ผู้เสนอราคา)" value={data.vendorRep} onChange={(v) => updateField('vendorRep', v)} />
          <TextField flex={1} label="เลขผู้เสียภาษี" value={data.vendorTaxId} onChange={(v) => updateField('vendorTaxId', v)} />
        </Row>
        <TextAreaField label="ที่อยู่คู่สัญญา" rows={2} value={data.vendorAddr} onChange={(v) => updateField('vendorAddr', v)} />
        <Row>
          <TextField flex={1} label="โทรศัพท์" value={data.vendorPhone} onChange={(v) => updateField('vendorPhone', v)} />
          <TextField flex={1} label="เลขที่ใบสั่ง" value={data.orderNo} onChange={(v) => updateField('orderNo', v)} />
        </Row>
      </Section>

      <Section visible={secVisible('committee')}>
        <h3>คณะกรรมการกำหนดราคากลาง</h3>
        <div className="hint">กรอกแยกช่องรายคน</div>
        <PersonRowsEditor kind="committee" people={data.committee} addLabel="+ เพิ่มกรรมการ" />
      </Section>

      <Section visible={secVisible('inspectors')}>
        <h3>คณะกรรมการตรวจรับพัสดุ</h3>
        <div className="hint">กรอกแยกช่องรายคน</div>
        <PersonRowsEditor kind="inspectors" people={data.inspectors} addLabel="+ เพิ่มกรรมการ" />
      </Section>

      <Section visible={secVisible('signers')}>
        <h3>ผู้ลงนาม</h3>
        <Row>
          <TextField flex={1.2} label="เจ้าหน้าที่" value={data.officer} onChange={(v) => updateField('officer', v)} />
          <TextField flex={1} label="ตำแหน่ง" value={data.officerPos} onChange={(v) => updateField('officerPos', v)} />
        </Row>
        <Row>
          <TextField flex={1.2} label="หัวหน้าเจ้าหน้าที่" value={data.headOfficer} onChange={(v) => updateField('headOfficer', v)} />
          <TextField flex={1} label="ตำแหน่ง" value={data.headOfficerPos} onChange={(v) => updateField('headOfficerPos', v)} />
        </Row>
        <Row>
          <TextField flex={1.2} label="เจ้าหน้าที่การเงิน" value={data.financeOfficer} onChange={(v) => updateField('financeOfficer', v)} />
          <TextField flex={1} label="ตำแหน่ง" value={data.financeOfficerPos} onChange={(v) => updateField('financeOfficerPos', v)} />
        </Row>
        <TextField label="ผู้มีอำนาจอนุมัติ (เรียน)" value={data.approver} onChange={(v) => updateField('approver', v)} />
        <TextField label="อ้างคำสั่งมอบอำนาจ" value={data.approverOrder} onChange={(v) => updateField('approverOrder', v)} />
        <Row>
          <TextField flex={1.2} label="ผู้อนุมัติเบิกจ่าย (เรียน)" value={data.payApprover} onChange={(v) => updateField('payApprover', v)} />
          <TextField flex={1} label="ประกาศโดย" value={data.announceHeader} onChange={(v) => updateField('announceHeader', v)} />
        </Row>
        <TextField label="อ้างคำสั่งมอบอำนาจ (เบิกจ่าย)" value={data.payApproverOrder} onChange={(v) => updateField('payApproverOrder', v)} />
      </Section>

      <Section visible={secVisible('items')}>
        <h3>รายการ / ราคาอ้างอิง</h3>
        <div className="hint">แยกช่องรายการ · จำนวนเงิน = จำนวน × ราคาต่อหน่วย (คำนวณให้อัตโนมัติ)</div>
        <ItemsEditor items={data.items} />
        <Row>
          <TextField flex={1.3} label="ผู้ประเมินราคา (ก่อสร้าง)" value={data.engineer} onChange={(v) => updateField('engineer', v)} />
          <TextField flex={1} label="ตำแหน่ง" value={data.engineerPos} onChange={(v) => updateField('engineerPos', v)} />
        </Row>
      </Section>

      <Section visible={secVisible('meta')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ flex: 1 }}>เลขที่ / วันที่ (รายฉบับ)</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '-2px 0 8px' }}>
          <span className="hint" style={{ margin: 0, flex: 1 }}>เอกสารที่มีเลขหนังสือราชการ — แก้ได้ทีละฉบับ</span>
          <MiniButton onClick={autoNumberMeta}>เรียงเลขที่ให้อัตโนมัติ</MiniButton>
        </div>
        {metaList.map((m) => (
          <div key={m.key} style={{ marginBottom: 9 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#5a6675', marginBottom: 3 }}>{m.label}</div>
            <Row>
              <input value={data.docmeta[m.key].no} onChange={(e) => updateMeta(m.key, 'no', e.target.value)} placeholder="เลขที่หนังสือ" />
              <input value={data.docmeta[m.key].date} onChange={(e) => updateMeta(m.key, 'date', e.target.value)} placeholder="ลงวันที่" />
            </Row>
          </div>
        ))}
      </Section>

      <Section visible={secVisible('dates')}>
        <h3>วันที่สำคัญ</h3>
        <Row>
          <TextField flex={1} label="วันที่ใบเสนอราคา" value={data.quoteDate} onChange={(v) => updateField('quoteDate', v)} />
          <TextField flex={1} label="วันที่ใบสั่ง" value={data.orderDate} onChange={(v) => updateField('orderDate', v)} />
        </Row>
        <Row>
          <TextField flex={1} label="วันที่ประกาศผู้ชนะ" value={data.announceDate} onChange={(v) => updateField('announceDate', v)} />
          <TextField flex={1} label="วันที่ตรวจรับ" value={data.inspectDate} onChange={(v) => updateField('inspectDate', v)} />
        </Row>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0 8px' }}>
          <span className="hint" style={{ margin: 0, flex: 1 }}>คำนวณจากวันที่ใบสั่ง + ระยะส่งมอบ (วัน)</span>
          <MiniButton onClick={autoCalcDeliveryDue}>คำนวณอัตโนมัติ</MiniButton>
        </div>
        <TextField label="ครบกำหนดส่งมอบ" value={data.deliveryDueDate} onChange={(v) => updateField('deliveryDueDate', v)} />
      </Section>

      <div style={{ height: 30 }} />
    </aside>
  );
}
