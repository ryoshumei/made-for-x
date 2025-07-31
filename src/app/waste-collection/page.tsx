import WasteCollectionForm from '@/components/WasteCollection';

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
    <div className="flex flex-col bg-gray-50">
      <WasteCollectionForm />
    </div>
  );
}
