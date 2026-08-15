import { LetterheadMeta, MemoHeader, SignHeadPair, SignSingle } from './common';
import type { DocProps } from './types';

export function Doc09Approve({ data, vm, garudaUrl, display }: DocProps) {
  const meta = data.docmeta.approve;
  const meta5 = data.docmeta.report;
  return (
    <div className="pg" data-doc-id="approve" style={{ display }}>
      <MemoHeader garudaUrl={garudaUrl} />
      <LetterheadMeta
        orgFull={vm.orgFull}
        no={meta.no}
        date={meta.date}
        subject={`รายงานผลการพิจารณาและขออนุมัติ${vm.cat.orderVerb} ${vm.projectFull}`}
      />
      <div className="doc-body">
        <p className="ni">
          <b>เรียน</b> {data.approver} ({data.approverOrder})
        </p>
        <p>
          ตามบันทึกข้อความ{data.org} ที่ {meta5.no} ลงวันที่ {meta5.date} อนุมัติให้ดำเนินการ{vm.projectFull} ภายในวงเงิน{' '}
          {vm.amountDash} บาท ({vm.amountText}) ขอรายงานผลการเจรจาตกลงราคา ดังนี้
        </p>
      </div>
      <table className="tbl">
        <thead>
          <tr style={{ background: '#eef1f4' }}>
            <th style={{ width: '1.2cm' }}>ที่</th>
            <th>รายละเอียดพัสดุที่จะขอซื้อ</th>
            <th style={{ width: '3.4cm' }}>รายชื่อผู้ยื่นข้อเสนอ</th>
            <th style={{ width: '2.4cm' }}>ราคาที่เสนอ</th>
            <th style={{ width: '2.8cm' }}>จำนวนเงินที่ขอซื้อ</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: 'center' }}>1</td>
            <td>{vm.projectFull}</td>
            <td>{data.vendorName}</td>
            <td style={{ textAlign: 'right' }}>{vm.amountFmt}</td>
            <td style={{ textAlign: 'right' }}>{vm.amountFmt}</td>
          </tr>
          <tr style={{ fontWeight: 700, background: '#f6f8fa' }}>
            <td colSpan={4}>รวมเป็นเงิน &nbsp; ({vm.amountText})</td>
            <td style={{ textAlign: 'right' }}>{vm.amountFmt}</td>
          </tr>
        </tbody>
      </table>
      <div className="doc-body">
        <p className="ni" style={{ fontSize: '13pt' }}>
          * ราคาที่เสนอและราคาที่ตกลงซื้อหรือจ้าง เป็นราคารวมภาษีมูลค่าเพิ่มและภาษีอื่น ค่าขนส่ง ค่าจดทะเบียน และค่าใช้จ่ายอื่น ๆ ทั้งปวง
        </p>
        <p>เกณฑ์การพิจารณาผลการยื่นข้อเสนอครั้งนี้ จะพิจารณาตัดสินโดยใช้หลักเกณฑ์ราคา</p>
        <p>
          ดังนั้น เพื่อให้เป็นไปตามระเบียบกระทรวงการคลังว่าด้วยการจัดซื้อจัดจ้างและการบริหารพัสดุภาครัฐ พ.ศ. 2560 ข้อ 79 {data.org}{' '}
          พิจารณาแล้วเห็นควรจัดซื้อ/จัดจ้าง จากผู้เสนอราคารายดังกล่าว
        </p>
        <p>จึงเรียนมาเพื่อโปรดทราบและพิจารณา หากเห็นชอบขอได้โปรดอนุมัติให้{vm.cat.orderVerb}จากผู้เสนอราคารายดังกล่าว</p>
      </div>
      <SignSingle marginTop={20} name={data.officer} pos={data.officerPos} roleLabel="ทำหน้าที่เจ้าหน้าที่" />
      <SignHeadPair
        marginTop={16}
        approver={data.approver}
        leftNote="- เพื่อโปรดพิจารณา"
        headOfficer={data.headOfficer}
        headOfficerPos={data.headOfficerPos}
        rightLabel="อนุมัติ"
      />
    </div>
  );
}
