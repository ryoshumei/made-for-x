// import Image from 'next/image'
import MercoinCalculator from '@/components/MercoinCalculator';
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main content */}
      <main className="flex-1">
        <MercoinCalculator />
      </main>
    </div>
  );
}
