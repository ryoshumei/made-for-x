import ReplyForm from '../components/ReplyForm';
import Link from 'next/link';
import { shouldShowNewTag } from '@/utils/feature-notifications';
import { ServiceStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';
import { UI_CONSTANTS } from '@/config/models';

export const metadata = {
  title: 'AI返信メール作成 - 自動返信文章生成ツール | Made for X',
  description:
    '受信したメールに対する返信を自動生成。元のメール内容を分析し、適切な返信文章をAIが作成します。ビジネスメールの返信作業を効率化します。',
  keywords: [
    '返信メール',
    'メール返信',
    '自動返信',
    'AI返信',
    'ビジネス返信',
    'メール自動化',
    '返信文章',
    '返信作成',
  ],
  openGraph: {
    title: 'AI返信メール作成 - 自動返信文章生成ツール',
    description:
      '受信したメールに対する返信を自動生成。元のメール内容を分析し、適切な返信文章をAIが作成します。',
    type: 'website',
    url: 'https://madeforx.com/mail-generator/reply',
  },
  twitter: {
    title: 'AI返信メール作成 - 自動返信文章生成ツール',
    description:
      '受信したメールに対する返信を自動生成。元のメール内容を分析し、適切な返信文章をAIが作成します。',
    card: 'summary_large_image',
  },
};

export default function ReplyPage() {
  const showNewTag = shouldShowNewTag();

  return (
    <>
      <ServiceStructuredData
        name="AI返信メール作成ツール"
        description="受信したメールに対する返信を自動生成。元のメール内容を分析し、適切な返信文章をAIが作成します。ビジネスメールの返信作業を効率化します。"
        url="https://madeforx.com/mail-generator/reply"
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
          { name: 'AI返信メール作成', url: 'https://madeforx.com/mail-generator/reply' },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <nav className="flex space-x-6 mb-8 border-b border-gray-200 pb-4">
            <Link href="/mail-generator" className="text-gray-600 hover:text-blue-600 pb-2">
              メール作成
            </Link>
            <Link
              href="/mail-generator/reply"
              className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
            >
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">日本語メール返信 AI</h1>
            <p className="text-gray-600">{UI_CONSTANTS.POWERED_BY_TEXT}</p>
          </div>

          <ReplyForm />
        </div>
      </div>
    </>
  );
}
