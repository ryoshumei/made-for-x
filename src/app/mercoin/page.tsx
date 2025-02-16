// import Image from 'next/image'
import MercoinCalculator from '@/components/MercoinCalculator';
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}

      <MercoinCalculator />

      {/* Footer - Updated styles */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p className="text-sm">
          © 2024 madeforx.com All Rights Reserved. Powered by OpenAI GPT-4o
        </p>
      </footer>
    </div>
  );
}
