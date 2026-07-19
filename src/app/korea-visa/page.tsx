import { KoreaVisaTool } from '@/components/KoreaVisa';
import {
  ServiceStructuredData,
  BreadcrumbStructuredData,
  FAQStructuredData,
} from '@/components/StructuredData';
import FAQSection from '@/components/FAQSection';

export const metadata = {
  title: '韓国ビザ申請書 オンライン入力ツール - 사증발급신청서をブラウザで記入',
  description:
    '韓国ビザ申請書（사증발급신청서・別紙第17号書式）をブラウザ上のフォームで入力し、公式PDFにそのまま書き込んでダウンロード。データはサーバーに送信されず、すべてブラウザ内で処理。自動下書き保存対応、無料・登録不要。',
  keywords: [
    '韓国ビザ',
    '韓国ビザ申請書',
    '사증발급신청서',
    'ビザ申請書 記入',
    'Korea visa application form',
    'visa application form korea',
    'PDF 記入 オンライン',
    '韓国 査証',
  ],
  alternates: {
    canonical: '/korea-visa',
    languages: {
      'ja-JP': '/korea-visa',
      'x-default': '/korea-visa',
    },
  },
  openGraph: {
    title: '韓国ビザ申請書 オンライン入力ツール | Made for X',
    description:
      '韓国ビザ申請書（사증발급신청서）をブラウザで入力して公式PDFにダウンロード。データはサーバーに送信されません。',
    type: 'website',
    url: 'https://madeforx.com/korea-visa',
  },
  twitter: {
    title: '韓国ビザ申請書 オンライン入力ツール | Made for X',
    description:
      '韓国ビザ申請書（사증발급신청서）をブラウザで入力して公式PDFにダウンロード。データはサーバーに送信されません。',
    card: 'summary_large_image',
  },
};

const FAQ_ITEMS = [
  {
    question: 'このツールは公式のものですか？',
    answer:
      'いいえ。本ツールは非公式の入力補助ツールであり、韓国政府・大使館・領事館とは一切関係ありません。最新の公式様式は韓国ビザポータル（visa.go.kr）でご確認ください。',
  },
  {
    question: '入力した個人情報はどこに保存されますか？',
    answer:
      'すべての処理はブラウザ内で完結します。PDFも入力内容もサーバーには送信されません。下書きはお使いのブラウザ（localStorage）にのみ自動保存され、記入済みPDFをダウンロードした時点で自動的に削除されます。「すべてクリア」ボタンでいつでも手動削除できます。',
  },
  {
    question: 'ダウンロードしたPDFはそのまま提出できますか？',
    answer:
      '公式様式（別紙第17号書式）のPDFに入力内容を書き込むため、印刷して署名すれば提出用として使用できます。ただし提出前に、様式が最新版であること・記載内容に誤りがないことを必ずご確認ください。',
  },
  {
    question: '対応している様式はどのバージョンですか？',
    answer:
      '2022年2月7日改正版の사증발급신청서（出入国管理法施行規則 別紙第17号書式）を収録しています。法務部が様式を改正した場合、本ツールの様式は古くなる可能性があるため、ページ上部のリンクから最新の公式様式をご確認ください。',
  },
];

export default function KoreaVisaPage() {
  return (
    <>
      <ServiceStructuredData
        name="韓国ビザ申請書 入力ツール"
        description="韓国ビザ申請書（사증발급신청서）をブラウザ上で入力し、公式PDFに書き込んでダウンロードできる無料ツール。データはサーバーに送信されません。"
        url="https://madeforx.com/korea-visa"
        applicationCategory="UtilitiesApplication"
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
          { name: '韓国ビザ申請書 入力ツール', url: 'https://madeforx.com/korea-visa' },
        ]}
      />
      <FAQStructuredData items={FAQ_ITEMS} id="korea-visa-faq" />
      <KoreaVisaTool />
      <FAQSection items={FAQ_ITEMS} />
    </>
  );
}
