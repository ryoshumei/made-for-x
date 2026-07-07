// src/lib/waste/normalize.ts
export function normalize(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/[\s　]/g, '')
    .replace(/[・,、，]/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .trim();
}
