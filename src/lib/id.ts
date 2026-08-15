let counter = 0;

/** Small collision-safe id generator for client-only list rows (committee/inspectors/items). */
export function makeId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}
