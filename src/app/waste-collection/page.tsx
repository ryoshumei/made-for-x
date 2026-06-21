import WasteCollectionForm from '@/components/WasteCollection';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';

export const metadata = {
  title: '千葉県ごみ収集スケジュール検索 - 市町村・住所別収集日確認',
  description:
    '千葉県全60市町村のごみ収集スケジュールを郵便番号から検索。燃やすごみ、資源ごみ、ペットボトル等の収集日を地域別に確認できます。',
  keywords: [
    '千葉県',
    'ごみ収集',
    'ゴミ出し',
    '収集日',
    'ごみカレンダー',
    '燃やすごみ',
    '資源ごみ',
    '千葉',
  ],
  alternates: {
    canonical: '/waste-collection',
    languages: {
      'ja-JP': '/waste-collection',
      'x-default': '/waste-collection',
    },
  },
  openGraph: {
    title: '千葉県ごみ収集スケジュール検索 - 市町村・住所別収集日確認',
    description:
      '千葉県全60市町村のごみ収集スケジュールを郵便番号から検索。燃やすごみ、資源ごみ、ペットボトル等の収集日を地域別に確認できます。',
    type: 'website',
    url: 'https://madeforx.com/waste-collection',
  },
  twitter: {
    title: '千葉県ごみ収集スケジュール検索 - 市町村・住所別収集日確認',
    description: '千葉県全60市町村のごみ収集スケジュールを郵便番号から検索。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: '千葉県のごみ収集日はどうやって調べますか？',
    answer:
      '本ツールに住所、町名、または郵便番号を入力するだけで、その地域のごみ収集スケジュール（燃やすごみ、燃やさないごみ、資源ごみ）が表示されます。',
  },
  {
    question: '対応している地域はどこですか？',
    answer: '千葉県全60市町村に対応しています。',
  },
  {
    question: 'ごみの種類は何種類ありますか？',
    answer:
      '千葉県の各市町村では「燃やすごみ」「燃やさないごみ」「資源ごみ（びん・かん・ペットボトル・古紙等）」「有害ごみ」などに分類されており、それぞれ異なる収集日が設定されています。',
  },
  {
    question: '祝日でもごみ収集はありますか？',
    answer:
      '各市町村の方針に従って収集が行われます。年末年始など特別な期間は変更される場合があるので、各市町村の公式情報も併せてご確認ください。',
  },
];

export default function WasteCollectionPage() {
  return (
    <>
      <ServiceStructuredData
        name="千葉県ごみ収集スケジュール検索"
        description="千葉県全60市町村の地域別ごみ収集スケジュールを郵便番号から簡単検索。燃やすごみ、資源ごみ、ペットボトル等の収集日を住所から瞬時に確認できます。"
        url="https://madeforx.com/waste-collection"
        applicationCategory="UtilitiesApplication"
        serviceType="Government Service"
        areaServed={['千葉県', 'Chiba', 'Japan']}
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
          { name: '千葉県ごみ収集スケジュール', url: 'https://madeforx.com/waste-collection' },
        ]}
      />
      <FAQStructuredData items={FAQ_ITEMS} id="waste-collection-faq" />
      <div className="flex flex-col bg-gray-50">
        <WasteCollectionForm />
      </div>
    </>
  );
}
