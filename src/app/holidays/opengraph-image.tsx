import { ImageResponse } from 'next/og';
import { getNextHoliday } from '@/lib/holidays/holidays';
import { calculateBridgePlan } from '@/lib/holidays/bridge-calculator';
import holiday_jp from '@holiday-jp/holiday_jp';
import { Holiday } from '@/lib/holidays/types';

export const runtime = 'edge';

export const alt = '次の祝日カウントダウン・連休プランナー';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function formatDate(date: Date): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = days[date.getDay()];
  return `${y}年${m}月${d}日（${dow}）`;
}

function formatShortRange(start: Date, end: Date): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const fmt = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}（${days[date.getDay()]}）`;
  return `${fmt(start)} 〜 ${fmt(end)}`;
}

function daysUntil(target: Date): number {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = startOfTarget.getTime() - startOfToday.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function getAllHolidays(): Holiday[] {
  const now = new Date();
  const twoYears = new Date(now);
  twoYears.setFullYear(twoYears.getFullYear() + 2);
  return holiday_jp
    .between(now, twoYears)
    .map((h: { date: Date; name: string; name_en: string }) => ({
      date: h.date,
      name: h.name,
      nameEn: h.name_en,
    }));
}

export default async function OpenGraphImage() {
  const holiday = getNextHoliday();
  const plan = holiday ? calculateBridgePlan(holiday.date, getAllHolidays()) : null;
  const days = holiday ? daysUntil(holiday.date) : null;
  const ptoLabel = plan
    ? plan.ptoDaysNeeded > 0
      ? `有給${plan.ptoDaysNeeded}日で ${formatShortRange(plan.startDate, plan.endDate)}`
      : formatShortRange(plan.startDate, plan.endDate)
    : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
          padding: '60px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              backgroundColor: '#1f2937',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            X
          </div>
          <div style={{ fontSize: 30, color: '#1f2937', fontWeight: 600, display: 'flex' }}>
            Made for X
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {holiday && plan && days !== null ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  color: '#475569',
                  display: 'flex',
                  marginBottom: 8,
                }}
              >
                次の祝日
              </div>
              <div
                style={{
                  fontSize: 90,
                  fontWeight: 800,
                  color: '#0f172a',
                  display: 'flex',
                  marginBottom: 8,
                }}
              >
                🎌 {holiday.name}
              </div>
              <div
                style={{
                  fontSize: 34,
                  color: '#334155',
                  display: 'flex',
                  marginBottom: 36,
                }}
              >
                {formatDate(holiday.date)}
              </div>

              <div style={{ display: 'flex', gap: 32 }}>
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 24,
                    padding: '24px 56px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                  }}
                >
                  <div style={{ fontSize: 22, color: '#64748b', display: 'flex' }}>あと</div>
                  <div
                    style={{
                      fontSize: 96,
                      fontWeight: 800,
                      color: '#1d4ed8',
                      lineHeight: 1,
                      display: 'flex',
                    }}
                  >
                    {days}
                  </div>
                  <div style={{ fontSize: 22, color: '#64748b', display: 'flex' }}>日</div>
                </div>

                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 24,
                    padding: '24px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    minWidth: 420,
                  }}
                >
                  <div style={{ fontSize: 22, color: '#64748b', display: 'flex' }}>連休プラン</div>
                  <div
                    style={{
                      fontSize: 76,
                      fontWeight: 800,
                      color: '#1d4ed8',
                      lineHeight: 1.1,
                      display: 'flex',
                    }}
                  >
                    {plan.totalDaysOff}連休
                  </div>
                  <div style={{ fontSize: 22, color: '#0369a1', display: 'flex' }}>{ptoLabel}</div>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: '#0f172a',
                display: 'flex',
              }}
            >
              次の祝日カウントダウン
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 22, color: '#475569', display: 'flex' }}>
            有給を活かして最長の連休を計画
          </div>
          <div style={{ fontSize: 22, color: '#475569', display: 'flex' }}>
            madeforx.com/holidays
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
