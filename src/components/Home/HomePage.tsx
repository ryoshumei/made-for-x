import NavigationGrid from './NavigationGrid';
import FeedbackButton from './FeedbackButton';

export default function HomePage() {
  return (
    <div className="flex-grow flex flex-col justify-center items-center bg-gray-50 px-4 py-8">
      <div className="text-center mb-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          日本の生活とビジネスを支える無料ツール集
        </h1>
        <p className="text-gray-600 text-base sm:text-lg">
          AIメール作成、メルカリ配送料計算、船橋市ごみ収集、日本郵便インボイス、休憩タイマー、祝日カウントダウン
          — 必要なツールがここに揃います。
        </p>
      </div>
      <NavigationGrid />
      <FeedbackButton />
    </div>
  );
}
