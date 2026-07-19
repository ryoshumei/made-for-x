/**
 * Bundled template registry: PDF SHA-256 → verified template. A hash hit
 * means an instant form with zero LLM calls — the product's primary path
 * for known forms. ksa-visa-v1.json starts as the resolver draft and is
 * replaced by the human-calibrated golden via /calibrate.
 */
import { FormTemplateSchema, type FormTemplate } from '../template/schema';
import ksaVisaJson from './ksa-visa-v1.json';

const ksaVisa: FormTemplate = FormTemplateSchema.parse(ksaVisaJson);

export const bundledTemplates: Readonly<Record<string, FormTemplate>> = {
  [ksaVisa.pdf.sha256]: ksaVisa,
};

export const SAMPLE_TEMPLATE = ksaVisa;
