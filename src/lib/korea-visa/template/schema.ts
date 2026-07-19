/**
 * FormTemplate: the cached, human-calibratable description of one PDF form.
 * All rects are PDF user space (bottom-left origin, y-up) — see coords.ts.
 * The golden template for the Korean visa form is committed at
 * src/templates/ksa-visa-v1.json and looked up by PDF SHA-256.
 */
import { z } from 'zod';

export const RectSchema = z.strictObject({
  x: z.number(),
  y: z.number(),
  w: z.number().nonnegative(),
  h: z.number().nonnegative(),
});
export type Rect = z.infer<typeof RectSchema>;

export const BilingualSchema = z.strictObject({
  ko: z.string(),
  en: z.string(),
});
export type Bilingual = z.infer<typeof BilingualSchema>;

const VisibleWhenSchema = z.strictObject({
  fieldId: z.string(),
  equals: z.union([z.string(), z.array(z.string())]),
});

const ValidationSchema = z.strictObject({
  kind: z.enum(['year', 'month', 'day', 'email', 'phone', 'digits', 'free']).optional(),
  pattern: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  hint: z.strictObject({ ko: z.string().optional(), en: z.string().optional() }).optional(),
});

const FieldBase = z.strictObject({
  id: z.string().regex(/^[a-z0-9_]+$/),
  sectionId: z.string(),
  page: z.number().int().nonnegative(),
  label: BilingualSchema,
  required: z.boolean().optional(),
  visibleWhen: VisibleWhenSchema.optional(),
  validation: ValidationSchema.optional(),
  /** Set by the resolver on ambiguity; calibration UI shows these red. */
  needsReview: z.boolean().optional(),
  /** Calibration fine-tune of the text baseline, pt. */
  baselineNudge: z.number().optional(),
});

const TextFontSchema = z.strictObject({
  size: z.number().positive(),
  minSize: z.number().positive(),
  align: z.enum(['left', 'center']).default('left'),
});

export const TextFieldSchema = FieldBase.extend({
  type: z.literal('text'),
  rect: RectSchema,
  font: TextFontSchema,
  padX: z.number().optional(),
});

export const MultilineFieldSchema = FieldBase.extend({
  type: z.literal('multiline'),
  rect: RectSchema,
  font: z.strictObject({
    size: z.number().positive(),
    minSize: z.number().positive(),
    lineHeight: z.number().positive().default(1.25),
  }),
  maxLines: z.number().int().positive(),
});

export const DateSlotKeySchema = z.enum(['full', 'yyyy', 'mm', 'dd']);

export const DateFieldSchema = FieldBase.extend({
  type: z.literal('date'),
  /** One "full" slot (drawn as yyyy/mm/dd) or separate yyyy/mm/dd slots. */
  slots: z
    .array(z.strictObject({ key: DateSlotKeySchema, rect: RectSchema }))
    .min(1)
    .max(3),
  font: z.strictObject({
    size: z.number().positive(),
    align: z.enum(['left', 'center']).default('center'),
  }),
});

export const OptionSchema = z.strictObject({
  value: z.string().regex(/^[a-z0-9_]+$/),
  label: BilingualSchema,
  /** The bracket-gap draw area: the ✓ is centered in this rect. */
  gapRect: RectSchema,
  /** Provenance for the calibration overlay only. */
  bracket: z.strictObject({ open: RectSchema, close: RectSchema }).optional(),
});

export const OptionGroupSchema = FieldBase.extend({
  /** radio = single choice, checkbox = multiple. */
  type: z.enum(['radio', 'checkbox']),
  options: z.array(OptionSchema).min(1),
});

export const TableFieldSchema = FieldBase.extend({
  type: z.literal('table'),
  columns: z.array(z.strictObject({ key: z.string(), label: BilingualSchema })).min(1),
  /** Printed blank rows; the UI offers exactly rows.length entries. */
  rows: z.array(z.strictObject({ cells: z.array(RectSchema) })).min(1),
  font: z.strictObject({ size: z.number().positive(), minSize: z.number().positive() }),
});

export const FieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  MultilineFieldSchema,
  DateFieldSchema,
  OptionGroupSchema,
  TableFieldSchema,
]);
export type Field = z.infer<typeof FieldSchema>;
export type TextField = z.infer<typeof TextFieldSchema>;
export type MultilineField = z.infer<typeof MultilineFieldSchema>;
export type DateField = z.infer<typeof DateFieldSchema>;
export type OptionGroup = z.infer<typeof OptionGroupSchema>;
export type TableField = z.infer<typeof TableFieldSchema>;

export const SectionSchema = z.strictObject({
  id: z.string(),
  index: z.number().int().nonnegative(),
  label: BilingualSchema,
  page: z.number().int().nonnegative(),
});
export type Section = z.infer<typeof SectionSchema>;

export const FormTemplateSchema = z.strictObject({
  schemaVersion: z.literal(1),
  id: z.string(),
  title: BilingualSchema,
  pdf: z.strictObject({
    sha256: z.string().length(64),
    pageCount: z.number().int().positive(),
    pageSizes: z.array(z.strictObject({ w: z.number(), h: z.number() })),
  }),
  sections: z.array(SectionSchema),
  fields: z.array(FieldSchema),
  excludedZones: z.array(
    z.strictObject({ page: z.number().int().nonnegative(), rect: RectSchema, reason: z.string() })
  ),
  provenance: z.strictObject({
    source: z.enum(['golden', 'vision', 'vision+calibrated']),
    visionModel: z.string().optional(),
    calibratedAt: z.string().optional(),
  }),
});
export type FormTemplate = z.infer<typeof FormTemplateSchema>;

/* ------------------------------------------------------------------ */
/* Form values                                                         */
/* ------------------------------------------------------------------ */

export interface DateValue {
  yyyy: string;
  mm: string;
  dd: string;
}

/** text/multiline → string · radio → value string · checkbox → value[] · date → DateValue · table → rows×cells strings */
export type FieldValue = string | string[] | DateValue | string[][];

export type FormValues = Record<string, FieldValue>;

export const formatDateValue = (v: DateValue): string =>
  [v.yyyy, v.mm, v.dd].some((p) => p.trim() !== '') ? `${v.yyyy}/${v.mm}/${v.dd}` : '';
