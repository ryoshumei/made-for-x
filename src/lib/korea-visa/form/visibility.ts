/**
 * visibleWhen semantics, shared by the form UI (hide inputs) and the fill
 * engine (never draw values of hidden fields).
 */
import type { Field, FormValues } from '../template/schema';

export function isFieldVisible(field: Field, values: FormValues): boolean {
  if (!field.visibleWhen) return true;
  const controlling = values[field.visibleWhen.fieldId];
  const wanted = Array.isArray(field.visibleWhen.equals)
    ? field.visibleWhen.equals
    : [field.visibleWhen.equals];
  if (Array.isArray(controlling)) {
    // checkbox parent: visible when any selected value matches
    return controlling.some((v) => typeof v === 'string' && wanted.includes(v));
  }
  return typeof controlling === 'string' && wanted.includes(controlling);
}
