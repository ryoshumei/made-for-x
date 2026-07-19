'use client';

import { useMemo } from 'react';
import type {
  DateValue,
  Field,
  FormTemplate,
  FormValues,
  FieldValue,
} from '@/lib/korea-visa/template/schema';
import { isFieldVisible } from '@/lib/korea-visa/form/visibility';
import { DateParts, FieldLabel, OptionPills, TableRows, TextInput } from './fields';

export function FormView({
  template,
  values,
  warnings,
  onChange,
}: {
  template: FormTemplate;
  values: FormValues;
  warnings: string[];
  onChange: (fieldId: string, value: FieldValue | undefined) => void;
}) {
  const warnedFields = useMemo(() => {
    const s = new Set<string>();
    for (const w of warnings) s.add(w.split(':')[0].replace(/\[.*$/, ''));
    return s;
  }, [warnings]);

  const bySection = useMemo(() => {
    const map = new Map<string, Field[]>();
    for (const f of template.fields) {
      const list = map.get(f.sectionId) ?? [];
      list.push(f);
      map.set(f.sectionId, list);
    }
    return map;
  }, [template]);

  const renderField = (field: Field) => {
    if (!isFieldVisible(field, values)) return null;
    const value = values[field.id];
    const warned = warnedFields.has(field.id);
    let control: React.ReactNode;
    switch (field.type) {
      case 'text':
        control = (
          <TextInput
            field={field}
            value={(value as string) ?? ''}
            onChange={(v) => onChange(field.id, v)}
          />
        );
        break;
      case 'multiline':
        control = (
          <TextInput
            field={field}
            multiline
            value={(value as string) ?? ''}
            onChange={(v) => onChange(field.id, v)}
          />
        );
        break;
      case 'date':
        control = (
          <DateParts
            field={field}
            value={(value as DateValue) ?? { yyyy: '', mm: '', dd: '' }}
            onChange={(v) => onChange(field.id, v)}
          />
        );
        break;
      case 'radio':
      case 'checkbox':
        control = (
          <OptionPills
            field={field}
            value={value as string | string[] | undefined}
            onChange={(v) => onChange(field.id, v)}
          />
        );
        break;
      case 'table':
        control = (
          <TableRows
            field={field}
            value={value as string[][] | undefined}
            onChange={(v) => onChange(field.id, v)}
          />
        );
        break;
    }
    return (
      <div
        key={field.id}
        data-field={field.id}
        className={field.needsReview ? 'rounded-md bg-red-50 p-2 -m-2' : undefined}
      >
        <FieldLabel field={field} warned={warned} />
        {control}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {template.sections.map((section) => {
        const fields = bySection.get(section.id) ?? [];
        if (fields.length === 0) return null;
        return (
          <section key={section.id} id={`section-${section.id}`}>
            <h2 className="mb-3 border-b border-neutral-200 pb-1.5 text-base font-semibold text-neutral-800">
              <span className="mr-2 text-blue-600">{section.index + 1}.</span>
              {section.label.ko}
              <span className="ml-2 text-sm font-normal text-neutral-500">{section.label.en}</span>
              {section.label.ja && (
                <span className="ml-2 text-sm font-normal text-neutral-500">
                  {section.label.ja}
                </span>
              )}
              <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-normal text-neutral-500">
                p.{fields[0].page + 1}
              </span>
            </h2>
            <div className="space-y-4">{fields.map(renderField)}</div>
          </section>
        );
      })}
    </div>
  );
}
