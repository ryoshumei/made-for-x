import HomePage from '@/components/Home/HomePage';

export const metadata = {
  title: 'Made for X - AIツールと便利サービスの総合プラットフォーム',
  description:
    'ビジネス効率化を支援するAIツール集。メール自動作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便ツールなど、日常業務を効率化する便利な機能を提供します。',
  keywords: [
    'Made for X',
    'AIツール',
    'ビジネス効率化',
    'メール作成',
    'メルカリ',
    '船橋市',
    'ごみ収集',
    '日本郵便',
    '便利ツール',
    '自動化',
  ],
  openGraph: {
    title: 'Made for X - AIツールと便利サービスの総合プラットフォーム',
    description:
      'ビジネス効率化を支援するAIツール集。メール自動作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便ツールなど、日常業務を効率化する便利な機能を提供します。',
    type: 'website',
    url: 'https://madeforx.com',
  },
  twitter: {
    title: 'Made for X - AIツールと便利サービスの総合プラットフォーム',
    description:
      'ビジネス効率化を支援するAIツール集。メール自動作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便ツールなど、日常業務を効率化する便利な機能を提供します。',
    card: 'summary_large_image',
  },
};

export default function Home() {
  return <HomePage />;
}
