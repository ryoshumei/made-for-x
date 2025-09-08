import React from 'react';
import ShippingCalculator from '../../components/ShippingCalculator';
import { ServiceStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';

export const metadata = {
  title: 'メルカリ配送料金計算器 | Made for X',
  description:
    '商品の寸法を入力するだけで、メルカリの最適な配送方法と料金をすぐに確認できます。らくらくメルカリ便・ゆうゆうメルカリ便の全オプションに対応。',
  keywords: [
    'メルカリ',
    '配送料金',
    '計算器',
    'らくらくメルカリ便',
    'ゆうゆうメルカリ便',
    '配送方法',
    'ネコポス',
    'ゆうパケット',
    'Mercari',
    '送料計算',
  ],
  openGraph: {
    title: 'メルカリ配送料金計算器 - 最適な配送方法を瞬時に計算',
    description:
      '商品の寸法を入力するだけで、メルカリの最適な配送方法と料金をすぐに確認できます。らくらくメルカリ便・ゆうゆうメルカリ便の全オプションに対応。',
    type: 'website',
    url: 'https://madeforx.com/shipping-calculator',
  },
  twitter: {
    title: 'メルカリ配送料金計算器 - 最適な配送方法を瞬時に計算',
    description:
      '商品の寸法を入力するだけで、メルカリの最適な配送方法と料金をすぐに確認できます。らくらくメルカリ便・ゆうゆうメルカリ便の全オプションに対応。',
    card: 'summary_large_image',
  },
};

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
      <ShippingCalculator />
    </>
  );
}
