import React from 'react';
import ShippingCalculator from '../../components/ShippingCalculator';

export const metadata = {
  title: 'メルカリ配送料金計算器 | Made for X',
  description:
    '商品の寸法を入力するだけで、メルカリの最適な配送方法と料金をすぐに確認できます。らくらくメルカリ便・ゆうゆうメルカリ便の全オプションに対応。',
  keywords:
    'メルカリ, 配送料金, 計算器, らくらくメルカリ便, ゆうゆうメルカリ便, 配送方法, ネコポス, ゆうパケット',
};

export default function ShippingCalculatorPage() {
  return <ShippingCalculator />;
}
