'use client';

import type {
  DateField,
  DateValue,
  Field,
  FieldValue,
  OptionGroup,
  TableField,
} from '@/lib/korea-visa/template/schema';
import { useRef } from 'react';

const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export function FieldLabel({ field, warned }: { field: Field; warned: boolean }) {
  return (
    <label className="mb-1 flex items-baseline gap-2 text-sm">
      <span className="font-medium text-neutral-800">{field.label.ko}</span>
      <span className="text-xs text-neutral-500">{field.label.en}</span>
      {field.required && <span className="text-red-500">*</span>}
      {warned && (
        <span
          className="text-xs text-amber-600"
          title="枠に収まらない可能性があります / May not fit the printed box"
        >
          ⚠ 枠超過 / Overflow
        </span>
      )}
    </label>
  );
}

export function TextInput({
  field,
  value,
  onChange,
  multiline,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        id={`f-${field.id}`}
        className={`${inputCls} min-h-16 resize-y`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input
      id={`f-${field.id}`}
      className={inputCls}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function DateParts({
  field,
  value,
  onChange,
}: {
  field: DateField;
  value: DateValue;
  onChange: (v: DateValue) => void;
}) {
  const mmRef = useRef<HTMLInputElement>(null);
  const ddRef = useRef<HTMLInputElement>(null);
  const part = (
    key: 'yyyy' | 'mm' | 'dd',
    placeholder: string,
    w: string,
    next?: React.RefObject<HTMLInputElement | null>
  ) => (
    <input
      id={`f-${field.id}-${key}`}
      ref={key === 'mm' ? mmRef : key === 'dd' ? ddRef : undefined}
      className={`${inputCls} ${w} text-center tabular-nums`}
      type="text"
      inputMode="numeric"
      maxLength={key === 'yyyy' ? 4 : 2}
      placeholder={placeholder}
      value={value[key]}
      onChange={(e) => {
        const v = e.target.value.replace(/[^0-9]/g, '');
        onChange({ ...value, [key]: v });
        if (next?.current && v.length === (key === 'yyyy' ? 4 : 2)) next.current.focus();
      }}
    />
  );
  return (
    <div className="flex items-center gap-1.5">
      {part('yyyy', 'YYYY', 'w-20', mmRef)}
      <span className="text-neutral-400">/</span>
      {part('mm', 'MM', 'w-14', ddRef)}
      <span className="text-neutral-400">/</span>
      {part('dd', 'DD', 'w-14')}
    </div>
  );
}

export function OptionPills({
  field,
  value,
  onChange,
}: {
  field: OptionGroup;
  value: string | string[] | undefined;
  onChange: (v: FieldValue | undefined) => void;
}) {
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (v: string) => {
    if (field.type === 'radio') {
      onChange(selected.has(v) ? undefined : v);
    } else {
      const next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange([...next]);
    }
  };
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={field.label.en}>
      {field.options.map((o) => {
        const on = selected.has(o.value);
        return (
          <button
            key={o.value}
            id={`f-${field.id}-${o.value}`}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o.value)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              on
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-neutral-300 bg-white text-neutral-700 hover:border-blue-400'
            }`}
          >
            {o.label.ko}{' '}
            <span className={on ? 'text-blue-100' : 'text-neutral-400'}>{o.label.en}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TableRows({
  field,
  value,
  onChange,
}: {
  field: TableField;
  value: string[][] | undefined;
  onChange: (v: string[][]) => void;
}) {
  const rows = field.rows.map((row, r) => row.cells.map((_, c) => value?.[r]?.[c] ?? ''));
  const setCell = (r: number, c: number, v: string) => {
    const next = rows.map((row) => [...row]);
    next[r][c] = v;
    onChange(next);
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            {field.columns.map((col) => (
              <th key={col.key} className="text-left text-xs font-medium text-neutral-500">
                {col.label.ko} <span className="font-normal">{col.label.en}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <input
                    id={`f-${field.id}-${r}-${c}`}
                    className={`${inputCls} px-2 py-1 text-xs`}
                    type="text"
                    value={cell}
                    onChange={(e) => setCell(r, c, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
