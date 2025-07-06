import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="flex space-x-6 mb-8 border-b border-gray-200 pb-4">
          <Link 
            href="/mail-generator" 
            className="text-gray-600 hover:text-blue-600 pb-2"
          >
            メール作成
          </Link>
          <Link 
            href="/mail-generator/reply" 
            className="text-gray-600 hover:text-blue-600 pb-2"
          >
            返信作成
          </Link>
          <span className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium">
            プライバシーポリシー
          </span>
        </nav>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              プライバシーポリシー
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-6">
              当サイトは、利用者のプライバシーを尊重し、個人情報の保護に努めています。このプライバシーポリシーでは、当サイトのサービス「日本語メール作成 AI」および「日本語メール返信 AI」における情報の取り扱いについて説明します。
            </p>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  1. 使用する情報
                </h2>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>宛先</li>
                  <li>署名</li>
                  <li>要件</li>
                  <li>受信したメール</li>
                  <li>返信要件</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  2. 情報の利用目的
                </h2>
                <p className="text-gray-700">
                  当サービスは、利用者の宛先、署名、要件、受信したメール、返信要件の情報を元に、メールの作成および返信をサポートします。
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  3. 情報の保存
                </h2>
                <p className="text-gray-700">
                  宛先、署名、要件、受信したメール、返信要件の情報は、サービス提供の目的のみに使用され、それらの情報は保存されません。httpリクエストに関する情報や、IPアドレス、アクセス時間などのネットワーク情報は、データ分析のために保存・使用される場合があります。
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
                <div className="text-sm text-gray-500">
                  最終更新日: 2025年07月07日
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 