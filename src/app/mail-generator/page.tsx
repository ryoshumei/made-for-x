import MailGeneratorForm from './components/MailGeneratorForm';
import Link from 'next/link';
import { shouldShowNewTag } from '@/utils/feature-notifications';
import { UI_CONSTANTS } from '@/config/models';

export const metadata = {
  title: 'AI メール作成ツール - ビジネスメール自動生成 | Made for X',
  description:
    'AIが自動でビジネスメールを作成します。件名、内容、相手の情報を入力するだけで、丁寧で適切な日本語メールが完成。効率的なビジネスコミュニケーションをサポートします。',
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
  ],
  openGraph: {
    title: 'AI メール作成ツール - ビジネスメール自動生成',
    description:
      'AIが自動でビジネスメールを作成します。件名、内容、相手の情報を入力するだけで、丁寧で適切な日本語メールが完成。',
    type: 'website',
    url: 'https://madeforx.com/mail-generator',
  },
  twitter: {
    title: 'AI メール作成ツール - ビジネスメール自動生成',
    description:
      'AIが自動でビジネスメールを作成します。件名、内容、相手の情報を入力するだけで、丁寧で適切な日本語メールが完成。',
    card: 'summary_large_image',
  },
};

export default function MailGeneratorPage() {
  const showNewTag = shouldShowNewTag();

  return (
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
  );
}
