/**
 * The embedded fill font. Noto Sans KR covers Hangul + CJK ideographs +
 * kana + Latin + U+2713 (✓); it ships via npm and is copied to /public by
 * postinstall (copy-assets), so the browser and node read the same bytes.
 */
export const FONT_PUBLIC_PATH = '/fonts/NotoSansKR-Regular.ttf';

export async function loadFontBytes(): Promise<Uint8Array> {
  const res = await fetch(FONT_PUBLIC_PATH);
  if (!res.ok) throw new Error(`font fetch failed: ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}
