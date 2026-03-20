import React from 'react';
import { HolidayCard } from '@/components/Holidays';
import { ServiceStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';

export const metadata = {
  title: '次の祝日',
  description:
    '次の日本の祝日までのカウントダウンと、有給を活用した最適な連休プランを表示します。橋渡し休暇の計算で、効率的な休暇計画をサポート。',
  keywords: [
    '祝日',
    'カウントダウン',
    '連休',
    '有給',
    '橋渡し休暇',
    '日本の祝日',
    '休暇計画',
    'ゴールデンウィーク',
  ],
  openGraph: {
    title: '次の祝日 - 連休プランナー | Made for X',
    description:
      '次の日本の祝日までのカウントダウンと、有給を活用した最適な連休プランを表示します。',
    type: 'website',
    url: 'https://madeforx.com/holidays',
  },
  twitter: {
    title: '次の祝日 - 連休プランナー | Made for X',
    description:
      '次の日本の祝日までのカウントダウンと、有給を活用した最適な連休プランを表示します。',
    card: 'summary_large_image' as const,
  },
};

export default function HolidaysPage() {
  return (
    <>
      <ServiceStructuredData
        name="次の祝日カウントダウン"
        description="次の日本の祝日までのカウントダウンと、有給を活用した最適な連休プランを表示します。"
        url="https://madeforx.com/holidays"
        applicationCategory="UtilitiesApplication"
        offers={{
          price: '0',
          priceCurrency: 'JPY',
        }}
        provider={{
          name: 'Made for X',
          url: 'https://madeforx.com',
        }}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'ホーム', url: 'https://madeforx.com' },
          { name: '次の祝日', url: 'https://madeforx.com/holidays' },
        ]}
      />
      <HolidayCard />
    </>
  );
}
