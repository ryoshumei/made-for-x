import MailGeneratorForm from './components/MailGeneratorForm';
import Link from 'next/link';
import { shouldShowNewTag } from '@/utils/feature-notifications';
import { UI_CONSTANTS } from '@/config/models';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';

export const metadata = {
  title: 'AIメール作成ツール - ビジネス日本語メール自動生成',
  description:
    'AIがビジネスメールを自動作成。要件を入力するだけで、丁寧で適切な日本語ビジネスメールが完成。日本語・英語・中国語に対応。返信メール、チャットメッセージ、お詫び、お礼、会議依頼など、様々なシーンで活用できます。',
  keywords: [
    'AI',
    'メール作成',
    'ビジネスメール',
    '自動生成',
    '日本語メール',
    'OpenAI',
    'GPT',
    'メール自動化',
    'ビジネスツール',
    '返信メール',
    'お詫びメール',
    'お礼メール',
    '会議依頼',
    'チャット',
  ],
  alternates: {
    canonical: '/mail-generator',
    languages: {
      'ja-JP': '/mail-generator',
      'x-default': '/mail-generator',
    },
  },
  openGraph: {
    title: 'AIメール作成ツール - ビジネス日本語メール自動生成',
    description:
      'AIがビジネスメールを自動作成。要件を入力するだけで、丁寧で適切な日本語ビジネスメールが完成。日本語・英語・中国語に対応。',
    type: 'website',
    url: 'https://madeforx.com/mail-generator',
  },
  twitter: {
    title: 'AIメール作成ツール - ビジネス日本語メール自動生成',
    description:
      'AIがビジネスメールを自動作成。要件を入力するだけで、丁寧で適切な日本語ビジネスメールが完成。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: 'AIメール作成ツールはどのように使いますか？',
    answer:
      '要件欄に書きたい内容を日本語で入力し、「作成」ボタンを押すだけで、AIが適切なビジネスメールを自動生成します。宛先や署名はオプションです。',
  },
  {
    question: 'どのような種類のメールを作成できますか？',
    answer:
      '会議依頼、お礼、お詫び、問い合わせ、報告など、様々なビジネスシーンに対応。クイックタグから選ぶこともできます。さらに返信メール作成、チャットメッセージ作成にも対応しています。',
  },
  {
    question: '対応言語は何ですか？',
    answer:
      '日本語、English（英語）、简体中文（簡体字中国語）、繁體中文（繁体字中国語）の4言語に対応しています。',
  },
  {
    question: '料金はかかりますか？',
    answer: '完全無料でご利用いただけます。会員登録も不要で、すぐに使い始められます。',
  },
  {
    question: '入力した内容は保存されますか？',
    answer: 'メールの内容はサーバーに保存されません。プライバシーポリシーをご確認ください。',
  },
];

export default function MailGeneratorPage() {
  const showNewTag = shouldShowNewTag();

  return (
    <>
      <ServiceStructuredData
        name="AI メール作成ツール"
        description="AIが自動でビジネスメールを作成します。件名、内容、相手の情報を入力するだけで、丁寧で適切な日本語メールが完成。効率的なビジネスコミュニケーションをサポートします。"
        url="https://madeforx.com/mail-generator"
        applicationCategory="BusinessApplication"
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
          { name: 'AI メール作成ツール', url: 'https://madeforx.com/mail-generator' },
        ]}
      />
      <FAQStructuredData items={FAQ_ITEMS} id="mail-generator-faq" />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <nav className="flex space-x-6 mb-8 border-b border-gray-200 pb-4">
            <Link
              href="/mail-generator"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
              メール作成
            </Link>
            <Link href="/mail-generator/reply" className="text-gray-600 hover:text-blue-600 pb-2">
              返信作成
            </Link>
            <Link
              href="/mail-generator/chat"
              className="text-gray-600 hover:text-blue-600 pb-2 relative"
            >
              チャット作成
              {showNewTag && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full">
                  NEW
                </span>
              )}
            </Link>
          </nav>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">日本語メール作成 AI</h1>
            <p className="text-gray-600">{UI_CONSTANTS.POWERED_BY_TEXT}</p>
          </div>

          <MailGeneratorForm />
        </div>
      </div>
    </>
  );
}
