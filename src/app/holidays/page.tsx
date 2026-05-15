import React from 'react';
import { HolidayCard } from '@/components/Holidays';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';

export const metadata = {
  title: '次の祝日カウントダウン・連休プランナー',
  description:
    '日本の次の祝日までの日数を秒単位でカウントダウン。有給休暇を活用した橋渡し（ブリッジ）休暇プランを自動計算し、最長の連休を提案します。ゴールデンウィークやお盆など年間の祝日計画に最適。',
  keywords: [
    '祝日',
    'カウントダウン',
    '連休',
    '有給',
    '橋渡し休暇',
    'ブリッジ休暇',
    '日本の祝日',
    '休暇計画',
    'ゴールデンウィーク',
    'シルバーウィーク',
    'お盆',
    '年末年始',
    '次の祝日',
  ],
  alternates: {
    canonical: '/holidays',
    languages: {
      'ja-JP': '/holidays',
      'x-default': '/holidays',
    },
  },
  openGraph: {
    title: '次の祝日カウントダウン・連休プランナー | Made for X',
    description:
      '日本の次の祝日までの日数を秒単位でカウントダウン。有給休暇を活用した連休プランを自動計算し、最長の連休を提案します。',
    type: 'website',
    url: 'https://madeforx.com/holidays',
  },
  twitter: {
    title: '次の祝日カウントダウン・連休プランナー | Made for X',
    description:
      '日本の次の祝日までの日数を秒単位でカウントダウン。有給休暇を活用した連休プランを自動計算し、最長の連休を提案します。',
    card: 'summary_large_image' as const,
  },
};

const FAQ_ITEMS = [
  {
    question: '次の日本の祝日はいつですか？',
    answer:
      '日本の祝日カレンダーから次の祝日までの日数、時間、分、秒をリアルタイムで表示します。祝日名と曜日も確認できます。',
  },
  {
    question: '橋渡し休暇（ブリッジ休暇）とは何ですか？',
    answer:
      '橋渡し休暇とは、祝日と週末の間にある平日を有給休暇として取得することで、長い連休を作る方法です。本ツールでは最適な有給取得日を自動計算し、最長の連休プランを提案します。',
  },
  {
    question: '有給休暇は何日必要ですか？',
    answer:
      '次の祝日と週末の組み合わせを分析し、最も効率的に連休を伸ばせる有給日数（通常1〜3日）を表示します。少ない有給で最大の連休を実現します。',
  },
  {
    question: 'このツールは無料ですか？',
    answer:
      'はい、完全無料でご利用いただけます。会員登録やログインも不要で、ブラウザからすぐにアクセスできます。',
  },
];

export default function HolidaysPage() {
  return (
    <>
      <ServiceStructuredData
        name="次の祝日カウントダウン・連休プランナー"
        description="日本の次の祝日までの日数を秒単位でカウントダウン。有給休暇を活用した連休プランを自動計算し、最長の連休を提案します。"
        url="https://madeforx.com/holidays"
        applicationCategory="UtilitiesApplication"
        serviceType="Holiday Calendar"
        areaServed="Japan"
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
          { name: '次の祝日カウントダウン', url: 'https://madeforx.com/holidays' },
        ]}
      />
      <FAQStructuredData items={FAQ_ITEMS} id="holidays-faq" />
      <HolidayCard />
    </>
  );
}
