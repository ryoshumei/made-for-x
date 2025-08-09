import NavigationGrid from './NavigationGrid';
import FeedbackButton from './FeedbackButton';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-8">
      <NavigationGrid />
      <FeedbackButton />
    </div>
  );
}
