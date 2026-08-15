import type { DocProps } from './types';

const NBSP2 = '  ';

export function Doc06Price({ data, vm, display }: DocProps) {
  return (
    <div className="pg" data-doc-id="price" style={{ display }}>
      <div style={{ textAlign: 'right', fontWeight: 700, marginBottom: 2 }}>{vm.cat.priceForm}</div>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '17pt', marginBottom: 16 }}>{vm.cat.priceTitle}</div>
      <div className="doc-body" style={{ lineHeight: 1.6 }}>
        <p className="ni">1. ชื่อโครงการ {vm.projectFull}</p>
        <p className="ni">2. หน่วยงานเจ้าของโครงการ {vm.orgFull}</p>
        <p className="ni">3. วงเงินงบประมาณที่ได้รับจัดสรร {vm.amountFmt} บาท</p>
        {!vm.isConstruction && (
          <>
            <p className="ni">
              4. วันที่กำหนดราคากลาง {data.priceDate} เป็นเงิน {vm.amountFmt} บาท ราคา/หน่วย (ถ้ามี) ...................... บาท
            </p>
            <p className="ni">5. แหล่งที่มาของราคากลาง (ราคาอ้างอิง)</p>
            <p className="ni" style={{ textIndent: '1cm' }}>
              5.1 {data.vendorName} เสนอราคา {vm.amountFmt} บาท
            </p>
            <p className="ni" style={{ textIndent: '1cm' }}>
              5.2 ..............................................................................
            </p>
            <p className="ni" style={{ textIndent: '1cm' }}>
              5.3 ..............................................................................
            </p>
            <p className="ni">6. รายชื่อเจ้าหน้าที่ผู้กำหนดราคากลาง (ราคาอ้างอิง) ทุกคน</p>
            {data.committee.map((m, i) => (
              <p className="ni" style={{ textIndent: '1cm' }} key={m.id}>
                6.{i + 1} {m.name}
                {NBSP2}ตำแหน่ง {m.pos}
                {NBSP2}
                {m.role}
              </p>
            ))}
          </>
        )}
        {vm.isConstruction && (
          <>
            <p className="ni">4. ลักษณะงาน (โดยสังเขป) {data.scopeBrief}</p>
            <p className="ni">
              5. ราคากลางคำนวณ ณ วันที่ {data.priceDate} เป็นเงินจำนวน {vm.amountDash} บาท ({vm.amountText})
            </p>
            <p className="ni">6. บัญชีประมาณราคากลาง (ราคาอ้างอิง)</p>
            <p className="ni" style={{ textIndent: '1cm' }}>
              6.1 ประเมินราคาก่อสร้าง ประมาณการโดยวิศวกรประเมินราคา
            </p>
            <p className="ni" style={{ textIndent: '1.6cm' }}>
              {data.engineer} {data.engineerPos} ประเมินราคา ราคา {vm.amountDash} บาท ({vm.amountText})
            </p>
            <p className="ni">7. รายชื่อเจ้าหน้าที่ผู้กำหนดราคากลาง (ราคาอ้างอิง)</p>
            {data.committee.map((m, i) => (
              <p className="ni" style={{ textIndent: '1cm' }} key={m.id}>
                7.{i + 1} {m.name}
                {NBSP2}ตำแหน่ง {m.pos}
                {NBSP2}
                {m.role}
              </p>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
