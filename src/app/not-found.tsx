'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {/* 404 error graphic/number */}
      <div className="relative mb-8">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/404-icon.svg"
            alt="404"
            width={120}
            height={120}
            className="opacity-80"
            // Fallback if the image doesn't exist
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Error message */}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been removed. 
        Please check the URL or use the button below to return to the homepage.
      </p>

      {/* Back to home button */}
      <Link
        href="/"
        className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-300 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Home
      </Link>
    </div>
  );
}
