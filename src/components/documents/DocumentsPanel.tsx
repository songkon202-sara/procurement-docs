import type { JSX } from 'react';
import type { DocId, ProcurementData } from '../../types';
import type { DocViewModel } from '../../lib/viewModel';
import { docDisplay } from '../../lib/printDisplay';
import { useApp } from '../../state/store';
import { Doc01ApproveReq } from './Doc01ApproveReq';
import { Doc02Memo } from './Doc02Memo';
import { Doc03PriceReport } from './Doc03PriceReport';
import { Doc04Tor } from './Doc04Tor';
import { Doc05Report } from './Doc05Report';
import { Doc06Price } from './Doc06Price';
import { Doc07Quote } from './Doc07Quote';
import { Doc08Announce } from './Doc08Announce';
import { Doc09Approve } from './Doc09Approve';
import { Doc10Order } from './Doc10Order';
import { Doc11Inspect } from './Doc11Inspect';
import { Doc12InspectReport } from './Doc12InspectReport';
import { Doc13PayReq } from './Doc13PayReq';
import type { DocProps } from './types';

const DOC_COMPONENTS: Record<DocId, (props: DocProps) => JSX.Element> = {
  approveReq: Doc01ApproveReq,
  memo: Doc02Memo,
  priceReport: Doc03PriceReport,
  tor: Doc04Tor,
  report: Doc05Report,
  price: Doc06Price,
  quote: Doc07Quote,
  announce: Doc08Announce,
  approve: Doc09Approve,
  order: Doc10Order,
  inspect: Doc11Inspect,
  inspectReport: Doc12InspectReport,
  payReq: Doc13PayReq,
};

const DOC_ORDER: DocId[] = [
  'approveReq',
  'memo',
  'priceReport',
  'tor',
  'report',
  'price',
  'quote',
  'announce',
  'approve',
  'order',
  'inspect',
  'inspectReport',
  'payReq',
];

export function DocumentsPanel({ data, vm }: { data: ProcurementData; vm: DocViewModel }) {
  const { state } = useApp();
  const garudaLargeUrl = state.garuda2Url || state.garudaUrl;

  return (
    <>
      {DOC_ORDER.map((id) => {
        const Comp = DOC_COMPONENTS[id];
        const display = docDisplay(id, state.activeDoc, state.printing, state.printScope, state.printSet);
        return (
          <Comp
            key={id}
            data={data}
            vm={vm}
            garudaUrl={state.garudaUrl}
            garudaLargeUrl={garudaLargeUrl}
            display={display}
          />
        );
      })}
    </>
  );
}
