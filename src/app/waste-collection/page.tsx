import WasteCollectionForm from '@/components/WasteCollection';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';

export const metadata = {
  title: '船橋市ごみ収集スケジュール検索 - 住所別収集日確認',
  description:
    '船橋市の住所・地域別ごみ収集スケジュールを瞬時に検索。燃やすごみ、燃やさないごみ、資源ごみ、有害ごみの収集日を確認できます。郵便番号や町名から検索可能で、船橋市民のごみ出しをサポート。',
  keywords: [
    '船橋市',
    'ごみ収集',
    'ゴミ出し',
    '収集日',
    '燃やすごみ',
    '燃やさないごみ',
    '資源ごみ',
    '有害ごみ',
    '船橋',
    'Funabashi',
    'ごみカレンダー',
    '収集スケジュール',
    '船橋市ごみ',
    '千葉県船橋市',
  ],
  alternates: {
    canonical: '/waste-collection',
    languages: {
      'ja-JP': '/waste-collection',
      'x-default': '/waste-collection',
    },
  },
  openGraph: {
    title: '船橋市ごみ収集スケジュール検索 - 住所別収集日確認',
    description:
      '船橋市の住所・地域別ごみ収集スケジュールを瞬時に検索。燃やすごみ、燃やさないごみ、資源ごみの収集日を確認できます。',
    type: 'website',
    url: 'https://madeforx.com/waste-collection',
  },
  twitter: {
    title: '船橋市ごみ収集スケジュール検索 - 住所別収集日確認',
    description: '船橋市の住所・地域別ごみ収集スケジュールを瞬時に検索。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: '船橋市のごみ収集日はどうやって調べますか？',
    answer:
      '本ツールに住所、町名、または郵便番号を入力するだけで、その地域のごみ収集スケジュール（燃やすごみ、燃やさないごみ、資源ごみ）が表示されます。',
  },
  {
    question: '対応している地域はどこですか？',
    answer:
      '千葉県船橋市の全地域に対応しています。本町、湊町、海神、前原、西船橋、新船橋、東船橋、習志野台など、船橋市内の各エリアで利用可能です。',
  },
  {
    question: 'ごみの種類は何種類ありますか？',
    answer:
      '船橋市では「燃やすごみ」「燃やさないごみ」「資源ごみ（びん・かん・ペットボトル・古紙等）」「有害ごみ」などに分類されており、それぞれ異なる収集日が設定されています。',
  },
  {
    question: '祝日でもごみ収集はありますか？',
    answer:
      '船橋市の方針に従って収集が行われます。年末年始など特別な期間は変更される場合があるので、市の公式情報も併せてご確認ください。',
  },
];

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
      <FAQStructuredData items={FAQ_ITEMS} id="waste-collection-faq" />
      <div className="flex flex-col bg-gray-50">
        <WasteCollectionForm />
      </div>
    </>
  );
}
