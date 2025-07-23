import Link from 'next/link';
import {
  shouldShowUpdateNotification,
  getFormattedUpdateDate,
  shouldShowNewTag,
} from '@/utils/feature-notifications';

export default function PrivacyPolicyPage() {
  const showUpdateNotification = shouldShowUpdateNotification();
  const formattedUpdateDate = getFormattedUpdateDate();
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

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Update notification banner - only show within 60 days */}
          {showUpdateNotification && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    プライバシーポリシーを更新しました
                  </h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p>
                      新機能「ビジネスチャット作成
                      AI」の追加に伴い、プライバシーポリシーを更新いたしました。（
                      {formattedUpdateDate}）
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">プライバシーポリシー</h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              当サイトは、利用者のプライバシーを尊重し、個人情報の保護に努めています。このプライバシーポリシーでは、当サイトのサービス「日本語メール作成
              AI」、「日本語メール返信 AI」、および「ビジネスチャット作成
              AI」における情報の取り扱いについて説明します。
            </p>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">1. 使用する情報</h2>
                <div className="text-gray-700 space-y-2">
                  <p className="font-medium">メール作成機能：</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>宛先</li>
                    <li>署名</li>
                    <li>要件</li>
                  </ul>
                  <p className="font-medium mt-3">メール返信機能：</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>受信したメール</li>
                    <li>返信要件</li>
                  </ul>
                  <p className="font-medium mt-3">チャット作成機能：</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>要件</li>
                    <li>言語設定</li>
                    <li>絵文字オプション設定</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 情報の利用目的</h2>
                <p className="text-gray-700">
                  当サービスは、利用者が入力した情報を元に、以下の機能を提供します：
                </p>
                <ul className="list-disc list-inside text-gray-700 ml-4 mt-2 space-y-1">
                  <li>メール作成機能：宛先、署名、要件を元にしたビジネスメールの作成</li>
                  <li>メール返信機能：受信したメールと返信要件を元にした返信メールの作成</li>
                  <li>
                    チャット作成機能：要件を元にしたSlack、Teams等のビジネスチャットメッセージの作成
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 情報の保存</h2>
                <p className="text-gray-700">
                  入力された情報（宛先、署名、要件、受信したメール、返信要件、言語設定、絵文字オプション等）は、サービス提供の目的のみに使用され、それらの情報は保存されません。httpリクエストに関する情報や、IPアドレス、アクセス時間などのネットワーク情報は、データ分析のために保存・使用される場合があります。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  4. 個人を特定する情報を提供しない
                </h2>
                <p className="text-gray-700">
                  法的要請など、法律に基づく場合を除き、利用者の個人を特定する情報を第三者に提供することはありません。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  5. プライバシーポリシーの変更
                </h2>
                <p className="text-gray-700">
                  このプライバシーポリシーは、今後変更する可能性があります。変更された場合、当サイト上でのお知らせや、変更内容の公表を行います。
                </p>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <Link
                  href="/mail-generator"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← メール作成に戻る
                </Link>
                <div className="text-sm text-gray-500">最終更新日: {formattedUpdateDate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
