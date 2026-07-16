import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Made for X - 日本の生活とビジネスを支える無料ツール集',
    short_name: 'Made for X',
    description:
      'AIメール作成、メルカリ配送料計算、千葉県ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウン。日本での生活と仕事を効率化する無料ツールを提供します。',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#2563eb',
    lang: 'ja',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}
