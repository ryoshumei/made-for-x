import Link from 'next/link';
import { FaMailBulk, FaTrash, FaEnvelope, FaCalculator } from 'react-icons/fa';

export default function NavigationGrid() {
  const navItems = [
    {
      title: 'Export invoice (Japan Post)',
      subtitle: '日本郵便用の輸出インボイス',
      icon: <FaMailBulk size={40} className="text-blue-600" />,
      href: '/japanpost',
      available: true,
    },
    {
      title: 'Waste Collection (Funabashi)',
      subtitle: '船橋市ごみ収集スケジュール',
      icon: <FaTrash size={40} className="text-green-600" />,
      href: '/waste-collection',
      available: true,
    },
    {
      title: 'Japanese Email Generator',
      subtitle: '日本語メール作成 AI',
      icon: <FaEnvelope size={40} className="text-purple-600" />,
      href: '/mail-generator',
      available: true,
    },
    {
      title: 'Mercari Shipping Calculator',
      subtitle: 'メルカリ配送料金計算器',
      icon: <FaCalculator size={40} className="text-orange-600" />,
      href: '/shipping-calculator',
      available: true,
    },
    // Future navigation items (currently unavailable)
    ...Array(5).fill({
      title: 'Coming Soon',
      subtitle: undefined,
      icon: null,
      href: '#',
      available: false,
    }),
  ];

  return (
    <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={`
            aspect-square flex flex-col items-center justify-center
            rounded-xl p-6 transition-all duration-300
            ${
              item.available
                ? 'bg-white hover:shadow-xl hover:scale-105 border border-gray-100 cursor-pointer'
                : 'bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
        >
          <div className="mb-4 bg-gray-50 p-4 rounded-full">
            {item.icon || (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xl">?</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <span
              className={`font-medium block ${item.available ? 'text-gray-800' : 'text-gray-400'}`}
            >
              {item.title}
            </span>
            {item.subtitle && (
              <span
                className={`text-sm mt-1 block ${item.available ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {item.subtitle}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
