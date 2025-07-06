import ReplyForm from '../components/ReplyForm';
import Link from 'next/link';

export default function ReplyPage() {
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
            className="text-blue-600 border-b-2 border-blue-600 pb-2 font-medium"
          >
            返信作成
          </Link>
        </nav>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            日本語メール返信 AI
          </h1>
          <p className="text-gray-600">powered by OpenAI GPT-4o</p>
        </div>
        
        <ReplyForm />
      </div>
    </div>
  );
} 