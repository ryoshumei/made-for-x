/**
 * The embedded fill fonts. Noto Sans KR (primary) covers Hangul + Korean
 * hanja + kana + Latin + U+2713 (✓), but Korean type carries only the
 * traditional ideograph forms — Japanese shinjitai like 戸・込・渋 are
 * absent and would draw as tofu. Noto Sans JP fills those gaps via
 * per-character fallback (see fontSet.ts). Both fonts ship via npm and are
 * copied to /public by postinstall (copy-assets), so the browser and node
 * read the same bytes.
 */
export const PRIMARY_FONT_PUBLIC_PATH = '/fonts/NotoSansKR-Regular.ttf';
export const JP_FALLBACK_FONT_PUBLIC_PATH = '/fonts/NotoSansJP-Regular.ttf';

export interface FillFontBytes {
  primary: Uint8Array;
  /** Tried in order for characters the primary font has no glyph for. */
  fallbacks: Uint8Array[];
}

async function fetchBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`font fetch failed: ${res.status} (${path})`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function loadFontBytes(): Promise<FillFontBytes> {
  const [primary, jp] = await Promise.all([
    fetchBytes(PRIMARY_FONT_PUBLIC_PATH),
    fetchBytes(JP_FALLBACK_FONT_PUBLIC_PATH),
  ]);
  return { primary, fallbacks: [jp] };
}
