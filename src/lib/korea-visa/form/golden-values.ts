/**
 * Distinctive sample data covering EVERY field of a template — used by the
 * golden fill (human visual pass), the round-trip test (each value must be
 * found inside its own rect), and the ?golden=1 e2e run. Values are unique
 * per field (numeric suffix) so a misplaced draw is attributable.
 */
import type { DateValue, FormTemplate, FormValues } from '../template/schema';

export function goldenValues(template: FormTemplate): FormValues {
  const values: FormValues = {};
  // Which radio values must be selected so every conditional block shows.
  const triggers = new Map<string, string>();
  for (const f of template.fields) {
    if (f.visibleWhen && !Array.isArray(f.visibleWhen.equals)) {
      triggers.set(f.visibleWhen.fieldId, f.visibleWhen.equals);
    }
  }

  let seq = 0;
  for (const f of template.fields) {
    seq += 1;
    const n = String(seq).padStart(2, '0');
    switch (f.type) {
      case 'text': {
        const kind = f.validation?.kind;
        const tiny = f.rect.w < 20; // single-digit boxes like 자녀수 [ ]
        values[f.id] =
          kind === 'digits'
            ? tiny
              ? String((seq % 9) + 1)
              : `19${n}`
            : kind === 'phone'
              ? `080-1234-56${n}`
              : kind === 'email'
                ? `user${n}@example.com`
                : `SAMPLE ${n}`;
        break;
      }
      case 'multiline':
        values[f.id] = `1-2-${n} Sakura-cho, Minato-ku, Tokyo`;
        break;
      case 'date':
        values[f.id] = {
          yyyy: '1990',
          mm: '07',
          dd: String((seq % 28) + 1).padStart(2, '0'),
        } as DateValue;
        break;
      case 'radio': {
        const preferred = triggers.get(f.id);
        values[f.id] =
          preferred && f.options.some((o) => o.value === preferred)
            ? preferred
            : f.options[0].value;
        break;
      }
      case 'checkbox':
        values[f.id] = f.options.map((o) => o.value); // mark every gap
        break;
      case 'table':
        values[f.id] = f.rows.map((row, r) =>
          row.cells.map((_, c) => {
            const key = f.columns[c]?.key ?? `c${c}`;
            if (key === 'birth') return `1990/07/${String(r + 1).padStart(2, '0')}`;
            if (key === 'period') return `2024/01/0${r + 1}~2024/02/0${r + 1}`;
            return `${key.toUpperCase().slice(0, 7)} R${r + 1}`;
          })
        );
        break;
    }
  }
  return values;
}
