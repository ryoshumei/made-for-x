import WasteCollectionForm from '@/components/WasteCollection';
import { ServiceStructuredData, BreadcrumbStructuredData } from '@/components/StructuredData';

export const metadata = {
  title: '船橋市ごみ収集スケジュール検索 - 地域別収集日確認 | Made for X',
  description:
    '船橋市の地域別ごみ収集スケジュールを簡単検索。燃やすごみ、燃やさないごみ、資源ごみの収集日を住所から瞬時に確認できます。船橋市民の生活をサポートする便利なツールです。',
  keywords: [
    '船橋市',
    'ごみ収集',
    'ゴミ出し',
    '収集日',
    '燃やすごみ',
    '資源ごみ',
    '船橋',
    'Funabashi',
    'ごみカレンダー',
    '収集スケジュール',
  ],
  openGraph: {
    title: '船橋市ごみ収集スケジュール検索 - 地域別収集日確認',
    description:
      '船橋市の地域別ごみ収集スケジュールを簡単検索。燃やすごみ、燃やさないごみ、資源ごみの収集日を住所から瞬時に確認できます。',
    type: 'website',
    url: 'https://madeforx.com/waste-collection',
  },
  twitter: {
    title: '船橋市ごみ収集スケジュール検索 - 地域別収集日確認',
    description:
      '船橋市の地域別ごみ収集スケジュールを簡単検索。燃やすごみ、燃やさないごみ、資源ごみの収集日を住所から瞬時に確認できます。',
    card: 'summary_large_image',
  },
};

export default function WasteCollectionPage() {
  return (
    <>
      <ServiceStructuredData
        name="船橋市ごみ収集スケジュール検索"
        description="船橋市の地域別ごみ収集スケジュールを簡単検索。燃やすごみ、燃やさないごみ、資源ごみの収集日を住所から瞬時に確認できます。船橋市民の生活をサポートする便利なツールです。"
        url="https://madeforx.com/waste-collection"
        applicationCategory="UtilitiesApplication"
        serviceType="Government Service"
        areaServed={['船橋市', 'Funabashi', 'Japan']}
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
          { name: '船橋市ごみ収集スケジュール', url: 'https://madeforx.com/waste-collection' },
        ]}
      />
      <div className="flex flex-col bg-gray-50">
        <WasteCollectionForm />
      </div>
    </>
  );
}
