import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import GoogleAnalytics from '../components/GoogleAnalytics';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { UI_CONSTANTS } from '@/config/models';
import { OrganizationStructuredData, WebSiteStructuredData } from '@/components/StructuredData';
import { HeaderNav } from '@/components/Header';

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
    default: 'Made for X - 日本の生活とビジネスを支える無料ツール集',
    template: '%s | Made for X',
  },
  description:
    'AIメール作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウン。日本での生活と仕事を効率化する無料ツールを提供します。',
  keywords: [
    'Made for X',
    '便利ツール',
    'AIメール作成',
    'メルカリ配送料計算',
    '船橋市ごみ収集',
    '日本郵便',
    '輸出インボイス',
    '休憩タイマー',
    '祝日カウントダウン',
    '連休プランナー',
    'Funabashi',
    '船橋市',
    'ビジネス効率化',
    '日本語ツール',
  ],
  authors: [{ name: 'Made for X', url: 'https://madeforx.com' }],
  creator: 'Made for X',
  publisher: 'Made for X',
  applicationName: 'Made for X',
  category: 'productivity',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://madeforx.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ja-JP': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'Made for X - 日本の生活とビジネスを支える無料ツール集',
    description:
      'AIメール作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウン。日本での生活と仕事を効率化する無料ツールを提供します。',
    url: 'https://madeforx.com',
    siteName: 'Made for X',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Made for X - 日本の生活とビジネスを支える無料ツール集',
    description:
      'AIメール作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウンなどの無料ツール。',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <HeaderNav />

        <main className="flex-grow flex flex-col bg-gray-50">{children}</main>

        <footer className="bg-gray-800 text-white p-4 text-center">
          <p className="text-sm">
            © 2025 madeforx.com All Rights Reserved. Powered by {UI_CONSTANTS.MODEL_DISPLAY_NAME}
          </p>
        </footer>

        <OrganizationStructuredData
          name="Made for X"
          url="https://madeforx.com"
          description="AIメール作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウンなど、日本での生活と仕事を効率化する無料ツールを提供します。"
          logo="https://madeforx.com/logo.svg"
        />
        <WebSiteStructuredData
          name="Made for X"
          url="https://madeforx.com"
          description="AIメール作成、メルカリ配送料計算、船橋市ごみ収集スケジュール、日本郵便輸出インボイス、休憩タイマー、祝日カウントダウンなど、日本での生活と仕事を効率化する無料ツールを提供します。"
          publisher={{ name: 'Made for X', url: 'https://madeforx.com' }}
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
