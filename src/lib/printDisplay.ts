import type { DocId, PrintScope } from '../types';

/** Mirrors the prototype's `show(id)`: outside of printing, only the active doc is visible;
 * while printing, either just the active doc ("current" scope) or every checked doc ("all" scope). */
export function docDisplay(
  id: DocId,
  activeDoc: DocId,
  printing: boolean,
  printScope: PrintScope,
  printSet: Partial<Record<DocId, boolean>>,
): 'block' | 'none' {
  if (printing) {
    if (printScope === 'all') return printSet[id] !== false ? 'block' : 'none';
    return activeDoc === id ? 'block' : 'none';
  }
  return activeDoc === id ? 'block' : 'none';
}
