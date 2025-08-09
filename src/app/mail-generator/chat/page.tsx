import MailGeneratorForm from '../components/MailGeneratorForm';
import Link from 'next/link';
import { shouldShowNewTag } from '@/utils/feature-notifications';
import { UI_CONSTANTS } from '@/config/models';

export const metadata = {
  title: 'AIチャット形式メール作成 - 対話型ビジネスメール生成 | Made for X',
  description:
    'AIとの対話でビジネスメールを作成。チャット形式で自然な会話をしながら、適切なメール文章を自動生成します。複雑な要件も対話で簡単に伝えられます。',
  keywords: [
    'AIチャット',
    'メール作成',
    '対話型AI',
    'チャットボット',
    'ビジネスメール',
    '会話形式',
    'インタラクティブ',
    'AI対話',
  ],
  openGraph: {
    title: 'AIチャット形式メール作成 - 対話型ビジネスメール生成',
    description:
      'AIとの対話でビジネスメールを作成。チャット形式で自然な会話をしながら、適切なメール文章を自動生成します。',
    type: 'website',
    url: 'https://madeforx.com/mail-generator/chat',
  },
  twitter: {
    title: 'AIチャット形式メール作成 - 対話型ビジネスメール生成',
    description:
      'AIとの対話でビジネスメールを作成。チャット形式で自然な会話をしながら、適切なメール文章を自動生成します。',
    card: 'summary_large_image',
  },
};

export default function ChatGeneratorPage() {
  const showNewTag = shouldShowNewTag();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="flex space-x-6 mb-8 border-b border-gray-200 pb-4">
          <Link href="/mail-generator" className="text-gray-600 hover:text-blue-600 pb-2">
            メール作成
          </Link>
          <Link href="/mail-generator/reply" className="text-gray-600 hover:text-blue-600 pb-2">
            返信作成
          </Link>
          <Link
            href="/mail-generator/chat"
            className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium relative"
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ビジネスチャット作成 AI</h1>
          <p className="text-gray-600">{UI_CONSTANTS.POWERED_BY_TEXT} - Slack、Teams向け</p>
        </div>

        <MailGeneratorForm mode="chat" />
      </div>
    </div>
  );
}
