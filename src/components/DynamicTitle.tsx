'use client';

import { usePathname } from 'next/navigation';

const DynamicTitle = () => {
  const pathname = usePathname();

  const getTitleByPath = () => {
    if (pathname?.includes('/garbage_jp')) {
      return 'Japan Garbage Collection Calendar';
    } else if (pathname?.includes('/japanpost')) {
      return 'Export invoice generator for Japan Post';
    }
    return 'Made for X';
  };

  return <h1 className="ml-4 text-2xl font-bold">{getTitleByPath()}</h1>;
};

export default DynamicTitle;
