import { LetterheadMeta, MemoHeader, PersonRows, SignHeadPair, SignSingle } from './common';
import type { DocProps } from './types';

export function Doc05Report({ data, vm, garudaUrl, display }: DocProps) {
  const meta = data.docmeta.report;
  return (
    <div className="pg" data-doc-id="report" style={{ display }}>
      <MemoHeader garudaUrl={garudaUrl} />
      <LetterheadMeta orgFull={vm.orgFull} no={meta.no} date={meta.date} subject={`รายงานขอความเห็นชอบจัดซื้อ/จัดจ้าง ${vm.projectFull}`} />
      <div className="doc-body">
        <p className="ni">
          <b>เรียน</b> {data.approver} ({data.approverOrder})
        </p>
        <p>
          ด้วย{data.org} {data.district} มีความประสงค์จะจัดซื้อ/จัดจ้าง {vm.projectFull} เพื่อ {data.objective}
        </p>
        <p>จึงรายงานขอความเห็นชอบตามข้อ 22 ตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 ซึ่งมีรายละเอียด ดังต่อไปนี้</p>
        <p className="ni">
          1. เหตุผลและความจำเป็นที่ต้องจัดซื้อ/จัดจ้าง เพื่อ {data.objective}
        </p>
        <p className="ni">2. รายละเอียดของพัสดุที่จะจัดซื้อ/จ้าง รายละเอียดตามเอกสารแนบ</p>
        <p className="ni">
          3. ราคากลาง จากคณะกรรมการกำหนดราคากลาง จำนวนเงิน {vm.amountDash} บาท ({vm.amountText})
        </p>
        <p className="ni" style={{ textIndent: '1cm' }}>
          - จากคณะกรรมการกำหนดราคากลาง (มาตรา 4)
        </p>
        <p className="ni">
          4. วงเงินที่จะซื้อ/จ้าง เงินนอกงบประมาณจากเงินบำรุง {data.org} จำนวนเงิน {vm.amountDash} บาท ({vm.amountText})
        </p>
        <p className="ni">
          5. กำหนดเวลาที่ต้องการใช้พัสดุนั้น หรือให้งานนั้นแล้วเสร็จภายใน {data.deliverDays} วัน นับถัดจากวันลงนามในสัญญาซื้อขาย-สัญญาจ้าง/บันทึกตกลงซื้อ-จ้าง/ใบสั่งซื้อ-สั่งจ้าง
        </p>
        <p className="ni">
          6. วิธีที่จะซื้อ/จ้าง และเหตุผล ดำเนินการโดยวิธี{data.method} ตามนัยแห่งพระราชบัญญัติการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560{' '}
          {data.legalRef} เนื่องจากการจัดซื้อจัดจ้างสินค้า งานบริการ หรืองานก่อสร้าง ที่มีการผลิต จำหน่าย ก่อสร้าง หรือให้บริการทั่วไป
          และมีวงเงินในการจัดซื้อจัดจ้างครั้งหนึ่งไม่เกิน 500,000 บาท ให้ใช้วิธีเฉพาะเจาะจง
        </p>
        <p className="ni">7. หลักเกณฑ์การพิจารณาคัดเลือกข้อเสนอ โดยใช้เกณฑ์ราคา</p>
        <p className="ni">
          8. การขออนุมัติแต่งตั้งคณะกรรมการตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 ข้อ 25 (5)
          คณะกรรมการตรวจรับพัสดุ ประกอบด้วย
        </p>
      </div>
      <PersonRows people={data.inspectors} margin="2px 0 4px 1.2cm" nameFlex={1.6} posFlex={2.2} gap="3px" />
      <div className="doc-body">
        <p>
          จึงเรียนมาเพื่อโปรดพิจารณา หากเห็นชอบ ขอได้โปรดอนุมัติให้ดำเนินการตามนัยข้อ 24
          แห่งระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 และให้ใช้บันทึกนี้แทนคำสั่งแต่งตั้งคณะกรรมการตรวจรับพัสดุด้วย
        </p>
      </div>
      <SignSingle marginTop={22} name={data.officer} pos={data.officerPos} roleLabel="ทำหน้าที่เจ้าหน้าที่" />
      <SignHeadPair
        marginTop={16}
        approver={data.approver}
        leftNote="- เพื่อโปรดพิจารณา"
        headOfficer={data.headOfficer}
        headOfficerPos={data.headOfficerPos}
        rightLabel="ชอบ/อนุมัติ"
      />
    </div>
  );
}
