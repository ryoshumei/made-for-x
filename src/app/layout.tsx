import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import DynamicTitle from '../components/DynamicTitle';
import GoogleAnalytics from '../components/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { UI_CONSTANTS } from '@/config/models';
import { OrganizationStructuredData } from '@/components/StructuredData';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: {
    default: 'Made for X - 便利なツールとサービス',
    template: '%s | Made for X',
  },
  description:
    '便利なツールとサービスを提供するプラットフォーム - 船橋市ごみ収集スケジュールと日本郵便ツール',
  keywords: ['Made for X', '便利ツール', 'ごみ収集', '日本郵便', 'Funabashi', '船橋市'],
  authors: [{ name: 'Made for X' }],
  creator: 'Made for X',
  publisher: 'Made for X',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://madeforx.com'),
  openGraph: {
    title: 'Made for X - 便利なツールとサービス',
    description:
      '便利なツールとサービスを提供するプラットフォーム - 船橋市ごみ収集スケジュールと日本郵便ツール',
    url: 'https://madeforx.com',
    siteName: 'Made for X',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Made for X - 便利なツールとサービス',
    description:
      '便利なツールとサービスを提供するプラットフォーム - 船橋市ごみ収集スケジュールと日本郵便ツール',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* Add min-h-screen to ensure minimum height of viewport */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Header section */}
        <header className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
              <Image
                src="/logo.svg"
                alt="Made for X Logo"
                width={50}
                height={50}
                className="cursor-pointer"
              />
            </Link>
            <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
              <DynamicTitle />
            </Link>
          </div>
        </header>

        {/* Main content area with flex-grow to push footer down */}
        <main className="flex-grow flex flex-col bg-gray-50">{children}</main>

        {/* Footer will now stay at bottom */}
        <footer className="bg-gray-800 text-white p-4 text-center">
          <p className="text-sm">
            © 2025 madeforx.com All Rights Reserved. Powered by {UI_CONSTANTS.MODEL_DISPLAY_NAME}
          </p>
        </footer>

        {/* Structured Data */}
        <OrganizationStructuredData
          name="Made for X"
          url="https://madeforx.com"
          description="便利なツールとサービスを提供するプラットフォーム - 船橋市ごみ収集スケジュールと日本郵便ツール、AIメール作成ツール、メルカリ配送料計算器"
          logo="https://madeforx.com/logo.svg"
        />

        {/* Google Analytics */}
        <GoogleAnalytics />

        {/* Vercel Analytics & Speed Insights */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
