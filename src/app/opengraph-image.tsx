import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 86400;

export const alt = 'Made for X - 日本の生活とビジネスを支える無料ツール集';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const TOOLS = [
  'AIメール作成',
  'メルカリ配送料計算',
  '千葉県ごみ収集',
  '輸出インボイス',
  '祝日カウントダウン',
  '休憩タイマー',
];

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundImage: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
          padding: '60px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {[
              '#60a5fa',
              '#34d399',
              '#f87171',
              '#fb923c',
              '#a78bfa',
              '#22d3ee',
              '#fbbf24',
              '#e5e7eb',
              '#10b981',
            ].map((color) => (
              <div
                key={color}
                style={{
                  width: 25,
                  height: 25,
                  borderRadius: 6,
                  backgroundColor: color,
                  display: 'flex',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 72, color: '#1f2937', fontWeight: 700, display: 'flex' }}>
            Made for X
          </div>
        </div>

        <div
          style={{
            fontSize: 36,
            color: '#475569',
            marginTop: 32,
            display: 'flex',
          }}
        >
          日本の生活とビジネスを支える無料ツール集
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 12,
            marginTop: 40,
            maxWidth: 900,
          }}
        >
          {TOOLS.map((tool) => (
            <div
              key={tool}
              style={{
                display: 'flex',
                fontSize: 24,
                color: '#1e40af',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 9999,
                padding: '10px 24px',
              }}
            >
              {tool}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 24,
            color: '#64748b',
            marginTop: 44,
            display: 'flex',
          }}
        >
          madeforx.com ・ 無料・登録不要
        </div>
      </div>
    ),
    { ...size }
  );
}
