// src/lib/waste/lookup.ts
import type { PrismaClient } from '@prisma/client';
import { matchAreasByTowns } from './matching';
import type { LookupResult, AreaResult } from './types';

export async function lookupByZipcode(
  prisma: PrismaClient,
  zipcodeRaw: string
): Promise<LookupResult> {
  const zipcode = (zipcodeRaw ?? '').replace(/\D/g, '');
  if (zipcode.length !== 7) return { status: 'invalid' };

  const postals = await prisma.postalCode.findMany({
    where: { zipcode },
    include: { city: true },
  });
  if (postals.length === 0) return { status: 'not_found' };

  const uniqueCityIds = [...new Set(postals.map((p) => p.cityId))];
  if (uniqueCityIds.length > 1) {
    console.warn(`zipcode ${zipcode} maps to multiple cities: ${uniqueCityIds.join(', ')}`);
  }

  const c = postals[0].city;
  const towns = [...new Set(postals.map((p) => p.townName).filter((t) => t && t.length))];
  const areas = (await prisma.area.findMany({
    where: { cityId: c.id },
    orderBy: { areaName: 'asc' },
  })) as unknown as AreaResult[];

  const matched = matchAreasByTowns(towns, areas);
  return {
    status: 'ok',
    city: { cityCode: c.cityCode, name: c.name, prefecture: c.prefecture },
    towns,
    matchType: matched.length ? 'town' : 'city',
    areas: matched.length ? matched : areas,
  };
}
