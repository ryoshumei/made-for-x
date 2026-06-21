import { lookupByZipcode } from './lookup';

function mockPrisma(postals: any[], areas: any[]) {
  return {
    postalCode: { findMany: async () => postals },
    area: { findMany: async () => areas },
  } as any;
}

const city = { id: 1, cityCode: '122041', name: '船橋市', prefecture: '千葉県' };

describe('lookupByZipcode', () => {
  it('returns invalid for non-7-digit input', async () => {
    const r = await lookupByZipcode(mockPrisma([], []), '123');
    expect(r.status).toBe('invalid');
  });
  it('returns not_found when no postal rows', async () => {
    const r = await lookupByZipcode(mockPrisma([], []), '9999999');
    expect(r.status).toBe('not_found');
  });
  it('matchType=town when a town matches an area', async () => {
    const r = await lookupByZipcode(
      mockPrisma(
        [{ townName: '三山', city }],
        [
          { areaName: '三山 1～4丁目', searchText: '三山1～4丁目', schedules: [] },
          { areaName: '宮本 1丁目', searchText: '宮本1丁目', schedules: [] },
        ]
      ),
      '2740072'
    );
    expect(r.status).toBe('ok');
    expect(r.matchType).toBe('town');
    expect(r.areas).toHaveLength(1);
    expect(r.city!.name).toBe('船橋市');
  });
  it('matchType=city fallback when no town matches', async () => {
    const r = await lookupByZipcode(
      mockPrisma(
        [{ townName: '区分なし町', city }],
        [{ areaName: '区分1', searchText: '区分1', schedules: [] }]
      ),
      '2999999'
    );
    expect(r.matchType).toBe('city');
    expect(r.areas).toHaveLength(1);
  });
});
