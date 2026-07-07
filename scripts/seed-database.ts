import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { normalize } from '../src/lib/waste/normalize';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'prisma', 'data', 'waste');

interface RawSchedule {
  waste_type: string;
  waste_type_ja?: string | null;
  frequency: string;
  day_of_week?: string[] | null;
  week_of_month?: number[] | null;
  day_of_month?: number[] | null;
  collection_dates?: string[] | null;
  collection_time?: string | null;
}
interface RawArea {
  areaName: string;
  addressDetail: string | null;
  schedules: RawSchedule[];
}
interface RawCity {
  cityCode: string;
  cityName: string;
  prefecture: string;
  sourceUrl: string | null;
  areas: RawArea[];
}
interface RawPostal {
  zipcode: string;
  cityCode: string;
  townName: string;
}

function readJson<T>(filename: string): T {
  const p = path.join(DATA_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8')) as T;
  } catch (e) {
    throw new Error(`Failed to read/parse ${p}: ${(e as Error).message}`);
  }
}

function toCamel(s: RawSchedule) {
  return {
    wasteType: s.waste_type,
    wasteTypeJa: s.waste_type_ja ?? null,
    frequency: s.frequency,
    dayOfWeek: s.day_of_week ?? null,
    weekOfMonth: s.week_of_month ?? null,
    dayOfMonth: s.day_of_month ?? null,
    collectionDates: s.collection_dates ?? null,
    collectionTime: s.collection_time ?? null,
  };
}

async function main() {
  console.log('🌱 Seeding waste collection data...');
  const cities = readJson<RawCity[]>('chiba-waste-schedules.json');
  const postals = readJson<RawPostal[]>('chiba-postal-codes.json');

  // Idempotent: cascade-clear then re-insert (safe to run on every deploy).
  await prisma.city.deleteMany();

  const codeToId = new Map<string, number>();
  for (const c of cities) {
    const city = await prisma.city.create({
      data: {
        cityCode: c.cityCode,
        name: c.cityName,
        prefecture: c.prefecture,
        sourceUrl: c.sourceUrl,
      },
    });
    codeToId.set(c.cityCode, city.id);

    if (c.areas.length) {
      await prisma.area.createMany({
        data: c.areas.map((a) => ({
          cityId: city.id,
          areaName: a.areaName,
          addressDetail: a.addressDetail,
          searchText: normalize(`${a.areaName}${a.addressDetail ?? ''}`),
          schedules: a.schedules.map(toCamel),
        })),
      });
    }
  }
  console.log(`📍 Inserted ${codeToId.size} cities + areas, seeding postal codes…`);

  const validPostals = postals.filter((p) => codeToId.has(p.cityCode));
  const batchSize = 1000;
  for (let i = 0; i < validPostals.length; i += batchSize) {
    await prisma.postalCode.createMany({
      data: validPostals.slice(i, i + batchSize).map((p) => ({
        zipcode: p.zipcode,
        cityId: codeToId.get(p.cityCode)!,
        townName: p.townName,
      })),
    });
  }

  const [nc, na, np] = await Promise.all([
    prisma.city.count(),
    prisma.area.count(),
    prisma.postalCode.count(),
  ]);
  console.log(`✅ Seeded: ${nc} cities, ${na} areas, ${np} postal rows`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
