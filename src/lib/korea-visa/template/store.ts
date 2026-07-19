import { bundledTemplates } from '../templates';
import type { FormTemplate } from './schema';

/** Bundled-template lookup by PDF SHA-256. This tool ships exactly one form. */
export function lookupTemplate(sha256: string): FormTemplate | null {
  return bundledTemplates[sha256] ?? null;
}
