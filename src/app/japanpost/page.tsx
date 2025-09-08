import ExportInvoiceForm from '@/components/ExportInvoiceForm';
import { ServiceStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';

export const metadata = {
  title: '日本郵便ツール - 郵便番号検索・配送サービス情報 | Made for X',
  description:
    '日本郵便の各種サービスを便利に利用できるツールです。郵便番号検索、配送料金計算、サービス情報確認など、郵便・配送に関する機能を提供します。',
  keywords: [
    '日本郵便',
    '郵便番号',
    '配送料金',
    'ゆうパック',
    'レターパック',
    '郵便サービス',
    'Japan Post',
    '配送',
    '宅配',
  ],
  openGraph: {
    title: '日本郵便ツール - 郵便番号検索・配送サービス情報',
    description:
      '日本郵便の各種サービスを便利に利用できるツールです。郵便番号検索、配送料金計算、サービス情報確認など、郵便・配送に関する機能を提供します。',
    type: 'website',
    url: 'https://madeforx.com/japanpost',
  },
  twitter: {
    title: '日本郵便ツール - 郵便番号検索・配送サービス情報',
    description:
      '日本郵便の各種サービスを便利に利用できるツールです。郵便番号検索、配送料金計算、サービス情報確認など、郵便・配送に関する機能を提供します。',
    card: 'summary_large_image',
  },
};

export default function Home() {
  return (
    <>
      <ServiceStructuredData
        name="日本郵便ツール - 輸出インボイス作成"
        description="日本郵便の各種サービスを便利に利用できるツールです。郵便番号検索、配送料金計算、サービス情報確認など、郵便・配送に関する機能を提供します。"
        url="https://madeforx.com/japanpost"
        applicationCategory="BusinessApplication"
        serviceType="Postal Service"
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
          { name: '日本郵便ツール', url: 'https://madeforx.com/japanpost' },
        ]}
      />
      <div className="bg-gray-50">
        <ExportInvoiceForm />
      </div>
    </>
  );
}
