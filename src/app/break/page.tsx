import { BreakTimer } from '@/components/Break';

export const metadata = {
  title: 'Break Timer - Made for X | 休憩タイマー',
  description:
    '短時間休憩と長時間休憩のためのシンプルなタイマー。リラックスして、リフレッシュしましょう。効率的な休憩管理でより良いパフォーマンスを実現。',
  keywords: [
    'break timer',
    '休憩タイマー',
    'short break',
    'long break',
    'リラックス',
    'リフレッシュ',
    '休憩管理',
    '作業効率',
  ],
  openGraph: {
    title: 'Break Timer - Made for X | 休憩タイマー',
    description:
      '短時間休憩と長時間休憩のためのシンプルなタイマー。リラックスして、リフレッシュしましょう。効率的な休憩管理でより良いパフォーマンスを実現。',
    type: 'website',
    url: 'https://madeforx.com/break',
  },
  twitter: {
    title: 'Break Timer - Made for X | 休憩タイマー',
    description:
      '短時間休憩と長時間休憩のためのシンプルなタイマー。リラックスして、リフレッシュしましょう。効率的な休憩管理でより良いパフォーマンスを実現。',
    card: 'summary_large_image',
  },
};

export default function BreakPage() {
  return <BreakTimer />;
}
