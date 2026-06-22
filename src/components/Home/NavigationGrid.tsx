import Link from 'next/link';
import {
  FaMailBulk,
  FaTrash,
  FaEnvelope,
  FaCalculator,
  FaClock,
  FaCalendarAlt,
} from 'react-icons/fa';

interface NavItem {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  accent: {
    iconColor: string;
    iconBg: string;
    border: string;
  };
}

const NAV_ITEMS: NavItem[] = [
  {
    title: '日本語メール作成 AI',
    subtitle: 'Japanese Email Generator',
    description: 'AIがビジネスメールを瞬時に下書き',
    icon: <FaEnvelope size={28} />,
    href: '/mail-generator',
    accent: {
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 group-hover:bg-purple-100',
      border: 'hover:border-purple-200',
    },
  },
  {
    title: 'メルカリ配送料計算器',
    subtitle: 'Mercari Shipping Calculator',
    description: 'サイズと重量から最安の配送方法を判定',
    icon: <FaCalculator size={28} />,
    href: '/shipping-calculator',
    accent: {
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50 group-hover:bg-orange-100',
      border: 'hover:border-orange-200',
    },
  },
  {
    title: '千葉県ごみ収集スケジュール',
    subtitle: 'Chiba Waste Collection',
    description: '住所から地区別の収集日を検索',
    icon: <FaTrash size={28} />,
    href: '/waste-collection',
    accent: {
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50 group-hover:bg-green-100',
      border: 'hover:border-green-200',
    },
  },
  {
    title: '日本郵便 輸出インボイス',
    subtitle: 'Japan Post Export Invoice',
    description: '商品名からHSコードを自動生成',
    icon: <FaMailBulk size={28} />,
    href: '/japanpost',
    accent: {
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 group-hover:bg-blue-100',
      border: 'hover:border-blue-200',
    },
  },
  {
    title: '次の祝日カウントダウン',
    subtitle: 'Holiday Countdown',
    description: '有給を活かした連休プランを自動提案',
    icon: <FaCalendarAlt size={28} />,
    href: '/holidays',
    accent: {
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50 group-hover:bg-red-100',
      border: 'hover:border-red-200',
    },
  },
  {
    title: '休憩タイマー',
    subtitle: 'Break Timer',
    description: '短時間・長時間休憩を切り替えて集中力アップ',
    icon: <FaClock size={28} />,
    href: '/break',
    accent: {
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 group-hover:bg-emerald-100',
      border: 'hover:border-emerald-200',
    },
  },
];

export default function NavigationGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto w-full">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 ${item.accent.border}`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${item.accent.iconBg} ${item.accent.iconColor}`}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 text-base leading-snug mb-0.5">
                {item.title}
              </h2>
              <p className="text-xs text-gray-400 mb-2">{item.subtitle}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
