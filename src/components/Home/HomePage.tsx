import NavigationGrid from './NavigationGrid';
import FeedbackButton from './FeedbackButton';

export default function HomePage() {
  return (
    <div className="flex-grow bg-gradient-to-b from-white via-gray-50 to-gray-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <section className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wide text-blue-700 bg-blue-50 rounded-full border border-blue-100">
            無料・登録不要
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            日本の生活とビジネスを
            <br className="hidden sm:inline" />
            支える<span className="text-blue-600">無料ツール集</span>
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            AIメール作成、配送料計算、ごみ収集スケジュール、輸出インボイスまで。
            <br className="hidden sm:inline" />
            日常の小さな手間を、ここでまとめて解決します。
          </p>
        </section>
        <NavigationGrid />
      </div>
      <FeedbackButton />
    </div>
  );
}
