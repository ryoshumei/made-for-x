/**
 * Postinstall: copy runtime assets that must be served from /public.
 * - pdfjs worker (same pinned version as the API, so worker/API never mismatch)
 * - Noto Sans KR + JP TTFs (embedded into filled PDFs — KR primary, JP
 *   fallback for shinjitai; ship via npm so every environment gets
 *   identical bytes)
 * Fails loudly if a source file is missing.
 */
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const assets: Array<[src: string, dest: string]> = [
  [
    join(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs'),
    join(root, 'public/pdf.worker.min.mjs'),
  ],
  [
    join(root, 'node_modules/@expo-google-fonts/noto-sans-kr/400Regular/NotoSansKR_400Regular.ttf'),
    join(root, 'public/fonts/NotoSansKR-Regular.ttf'),
  ],
  [
    join(root, 'node_modules/@expo-google-fonts/noto-sans-jp/400Regular/NotoSansJP_400Regular.ttf'),
    join(root, 'public/fonts/NotoSansJP-Regular.ttf'),
  ],
];

for (const [src, dest] of assets) {
  if (!existsSync(src)) {
    console.error(`[copy-assets] MISSING: ${src}`);
    process.exit(1);
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
  console.log(`[copy-assets] ${src} -> ${dest}`);
}
