import type { ProcurementData } from '../../types';
import type { DocViewModel } from '../../lib/viewModel';

export interface DocProps {
  data: ProcurementData;
  vm: DocViewModel;
  garudaUrl: string | null;
  garudaLargeUrl: string | null;
  display: 'block' | 'none';
}
