'use client';

import { usePathname } from 'next/navigation';

const DynamicTitle = () => {
  const pathname = usePathname();

  const getTitleByPath = () => {
    if (pathname?.includes('/garbage_jp')) {
      return 'Japan Garbage Collection Calendar';
    } else if (pathname?.includes('/waste-collection')) {
      return '船橋市ごみ収集スケジュール';
    } else if (pathname?.includes('/japanpost')) {
      return 'Export invoice generator for Japan Post';
    }
    return 'Made for X';
  };

  const getSubtitleByPath = () => {
    if (pathname?.includes('/waste-collection')) {
      return 'Funabashi City Waste Collection Schedule';
    } else if (pathname?.includes('/japanpost')) {
      return '日本郵便の輸出インボイス生成ツール - 商品名から税関コードを自動生成';
    } else if (pathname === '/') {
      return '便利なツールとサービスを提供するプラットフォーム - 船橋市ごみ収集スケジュールと日本郵便ツール';
    }
    return null;
  };

  const subtitle = getSubtitleByPath();

  return (
    <div className="ml-4">
      <h1 className="text-2xl font-bold">{getTitleByPath()}</h1>
      {subtitle && <p className="text-sm text-gray-300 mt-1">{subtitle}</p>}
    </div>
  );
};

export default DynamicTitle;
