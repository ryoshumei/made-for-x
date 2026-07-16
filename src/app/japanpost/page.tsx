import ExportInvoiceForm from '@/components/ExportInvoiceForm';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';
import FAQSection from '@/components/FAQSection';

export const metadata = {
  title: '日本郵便 輸出インボイス自動作成ツール - HSコード自動生成',
  description:
    '日本郵便（EMS、国際eパケット）の輸出インボイスをAIで自動作成。商品名から関税分類コード（HSコード）を自動判定。輸出書類の作成時間を大幅短縮、海外発送をスムーズに。',
  keywords: [
    '日本郵便',
    '輸出インボイス',
    'HSコード',
    'EMS',
    '国際eパケット',
    '関税コード',
    'インボイス自動作成',
    '国際郵便',
    '海外発送',
    'Japan Post',
    '輸出書類',
    '税関コード',
  ],
  alternates: {
    canonical: '/japanpost',
    languages: {
      'ja-JP': '/japanpost',
      'x-default': '/japanpost',
    },
  },
  openGraph: {
    title: '日本郵便 輸出インボイス自動作成ツール - HSコード自動生成',
    description:
      '日本郵便（EMS、国際eパケット）の輸出インボイスをAIで自動作成。商品名から関税分類コード（HSコード）を自動判定。',
    type: 'website',
    url: 'https://madeforx.com/japanpost',
  },
  twitter: {
    title: '日本郵便 輸出インボイス自動作成ツール - HSコード自動生成',
    description:
      '日本郵便（EMS、国際eパケット）の輸出インボイスをAIで自動作成。HSコードも自動判定。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: '輸出インボイスとは何ですか？',
    answer:
      '輸出インボイスは、海外発送時に税関で必要となる書類です。発送品の内容、価格、HSコード（関税分類番号）などが記載されています。EMSや国際eパケットなどの国際郵便で必要です。',
  },
  {
    question: 'HSコードはどのように決まりますか？',
    answer:
      '商品名を入力するとAIが商品内容を解析し、適切なHSコード（関税分類番号、Harmonized System Code）を自動判定します。世界共通の品目分類コードで、税関手続きで使用されます。',
  },
  {
    question: '対応している配送サービスは何ですか？',
    answer:
      '日本郵便のEMS（国際スピード郵便）、国際eパケット、国際eパケットライト、小形包装物など、主要な国際郵便サービスに対応しています。',
  },
  {
    question: '作成したインボイスはどのように使いますか？',
    answer:
      '生成されたインボイスはダウンロードして印刷し、海外発送時の梱包に同梱します。日本郵便の窓口で発送手続きの際に提出してください。',
  },
];

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
      <FAQStructuredData items={FAQ_ITEMS} id="japanpost-faq" />
      <div className="bg-gray-50">
        <ExportInvoiceForm />
        <FAQSection items={FAQ_ITEMS} />
      </div>
    </>
  );
}
