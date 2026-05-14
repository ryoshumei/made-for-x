import { BreakTimer } from '@/components/Break';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';

export const metadata = {
  title: '休憩タイマー - 集中と休憩の最適バランス',
  description:
    '短時間休憩（5分）と長時間休憩（15分）に対応したシンプルなタイマー。ポモドーロテクニックや集中作業の合間のリフレッシュに最適。仕事や勉強の効率を上げる休憩管理ツール。',
  keywords: [
    '休憩タイマー',
    'break timer',
    'short break',
    'long break',
    'リラックス',
    'リフレッシュ',
    '休憩管理',
    '作業効率',
    'ポモドーロ',
    'pomodoro',
    '集中タイマー',
    '勉強タイマー',
  ],
  alternates: {
    canonical: '/break',
    languages: {
      'ja-JP': '/break',
      'x-default': '/break',
    },
  },
  openGraph: {
    title: '休憩タイマー - 集中と休憩の最適バランス | Made for X',
    description:
      '短時間休憩（5分）と長時間休憩（15分）に対応したシンプルなタイマー。ポモドーロテクニックや集中作業の合間のリフレッシュに最適。',
    type: 'website',
    url: 'https://madeforx.com/break',
  },
  twitter: {
    title: '休憩タイマー - 集中と休憩の最適バランス | Made for X',
    description:
      '短時間休憩と長時間休憩のためのシンプルなタイマー。集中作業の合間のリフレッシュに最適。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: '休憩タイマーはどのように使いますか？',
    answer:
      '短時間休憩または長時間休憩を選択してスタートボタンを押すだけ。タイマー終了時に通知でお知らせします。作業の合間にお使いください。',
  },
  {
    question: 'ポモドーロテクニックで使えますか？',
    answer:
      'はい、ポモドーロテクニック（25分作業＋5分休憩）の休憩部分に最適です。短時間休憩（5分）と長時間休憩（15-30分）の両方をサポートしています。',
  },
  {
    question: '通知は送られますか？',
    answer: 'タイマー終了時にブラウザ通知でお知らせします。タブを切り替えても通知が届きます。',
  },
];

export default function BreakPage() {
  return (
    <>
      <ServiceStructuredData
        name="休憩タイマー"
        description="短時間休憩と長時間休憩に対応したシンプルなタイマー。ポモドーロテクニックや集中作業の合間のリフレッシュに最適。"
        url="https://madeforx.com/break"
        applicationCategory="UtilitiesApplication"
        offers={{
          price: '0',
          priceCurrency: 'JPY',
        }}
        provider={{
          name: 'Made for X',
          url: 'https://madeforx.com',
        }}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'ホーム', url: 'https://madeforx.com' },
          { name: '休憩タイマー', url: 'https://madeforx.com/break' },
        ]}
      />
      <FAQStructuredData items={FAQ_ITEMS} id="break-faq" />
      <BreakTimer />
    </>
  );
}
