import HomePage from '@/components/Home/HomePage';
import { FAQStructuredData } from '@/components/StructuredData';

export const metadata = {
  title: 'Made for X - 日本の生活とビジネスを支える無料ツール集',
  description:
    'AIメール作成、メルカリ配送料計算、千葉県ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウンなど、日本での生活と仕事を効率化する無料ツールを提供する総合プラットフォーム。',
  keywords: [
    'Made for X',
    'AIツール',
    'ビジネス効率化',
    'AIメール作成',
    'メルカリ配送料計算',
    '千葉県ごみ収集',
    '日本郵便',
    '輸出インボイス',
    '便利ツール',
    '自動化',
    '休憩タイマー',
    '祝日カウントダウン',
    '無料ツール',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'ja-JP': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'Made for X - 日本の生活とビジネスを支える無料ツール集',
    description:
      'AIメール作成、メルカリ配送料計算、千葉県ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウンなど、日本での生活と仕事を効率化する無料ツール。',
    type: 'website',
    url: 'https://madeforx.com',
  },
  twitter: {
    title: 'Made for X - 日本の生活とビジネスを支える無料ツール集',
    description:
      'AIメール作成、メルカリ配送料計算、千葉県ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウンなどの無料ツール。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: 'Made for Xとは何ですか？',
    answer:
      'Made for Xは、日本での生活とビジネスを効率化する無料Webツール集です。AIメール作成、メルカリ配送料計算、千葉県ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウンなど、日常で役立つツールを提供しています。',
  },
  {
    question: 'どのようなツールが利用できますか？',
    answer:
      '6つの主要ツールを提供：(1) AIメール作成ツール、(2) メルカリ配送料計算器、(3) 千葉県ごみ収集スケジュール、(4) 日本郵便輸出インボイス作成、(5) 休憩タイマー、(6) 祝日カウントダウン・連休プランナー。',
  },
  {
    question: '利用は無料ですか？',
    answer:
      'はい、全てのツールを完全無料でご利用いただけます。会員登録やログインも不要で、ブラウザからすぐにアクセスできます。',
  },
  {
    question: 'スマホからも使えますか？',
    answer:
      'はい、スマートフォン、タブレット、PCのいずれのデバイスからも利用可能です。レスポンシブデザインで快適にご利用いただけます。',
  },
];

export default function Home() {
  return (
    <>
      <FAQStructuredData items={FAQ_ITEMS} id="home-faq" />
      <HomePage />
    </>
  );
}
