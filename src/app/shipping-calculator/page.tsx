import React from 'react';
import ShippingCalculator from '../../components/ShippingCalculator';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';

export const metadata = {
  title: 'メルカリ配送料金計算器 - 最適な配送方法を瞬時に判定',
  description:
    '商品の縦・横・厚さ・重量を入力するだけで、メルカリの最適な配送方法と料金を自動計算。らくらくメルカリ便（ネコポス・宅急便コンパクト・宅急便）、ゆうゆうメルカリ便（ゆうパケット・ゆうパケットプラス・ゆうパック）の全オプションに対応。',
  keywords: [
    'メルカリ',
    '配送料金',
    '計算器',
    'らくらくメルカリ便',
    'ゆうゆうメルカリ便',
    '配送方法',
    'ネコポス',
    'ゆうパケット',
    '宅急便コンパクト',
    'ゆうパケットプラス',
    '宅急便',
    'ゆうパック',
    'Mercari',
    '送料計算',
    '送料比較',
  ],
  alternates: {
    canonical: '/shipping-calculator',
    languages: {
      'ja-JP': '/shipping-calculator',
      'x-default': '/shipping-calculator',
    },
  },
  openGraph: {
    title: 'メルカリ配送料金計算器 - 最適な配送方法を瞬時に判定',
    description:
      '商品の寸法を入力するだけで、メルカリの最適な配送方法と料金を自動計算。らくらくメルカリ便・ゆうゆうメルカリ便の全オプションに対応。',
    type: 'website',
    url: 'https://madeforx.com/shipping-calculator',
  },
  twitter: {
    title: 'メルカリ配送料金計算器 - 最適な配送方法を瞬時に判定',
    description: '商品の寸法を入力するだけで、メルカリの最適な配送方法と料金を自動計算。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: 'メルカリ配送料金計算器の使い方は？',
    answer:
      '商品の縦・横・厚さ・重量を入力すると、対応する全ての配送方法と料金が一覧表示されます。最安値の方法もハイライト表示されるので、すぐに最適な配送方法が分かります。',
  },
  {
    question: '対応している配送方法は何ですか？',
    answer:
      'らくらくメルカリ便（ネコポス、宅急便コンパクト、宅急便）とゆうゆうメルカリ便（ゆうパケット、ゆうパケットポスト、ゆうパケットプラス、ゆうパック）の全方式に対応しています。',
  },
  {
    question: '最安値の配送方法はどう判定されますか？',
    answer:
      '入力された商品サイズに対応可能な全ての配送方法の料金を比較し、最も安い方法を表示します。サイズ制限と料金の両方を考慮した正確な判定です。',
  },
  {
    question: '料金情報は最新ですか？',
    answer:
      'メルカリの公式料金表に基づいてデータを更新しています。重要な変更があった場合は速やかに反映します。',
  },
];

export default function ShippingCalculatorPage() {
  return (
    <>
      <ServiceStructuredData
        name="メルカリ配送料金計算器"
        description="商品の寸法を入力するだけで、メルカリの最適な配送方法と料金をすぐに確認できます。らくらくメルカリ便・ゆうゆうメルカリ便の全オプションに対応。"
        url="https://madeforx.com/shipping-calculator"
        applicationCategory="BusinessApplication"
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
          { name: 'メルカリ配送料金計算器', url: 'https://madeforx.com/shipping-calculator' },
        ]}
      />
      <FAQStructuredData items={FAQ_ITEMS} id="shipping-faq" />
      <ShippingCalculator />
    </>
  );
}
