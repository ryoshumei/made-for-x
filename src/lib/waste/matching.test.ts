import { matchAreasByTowns } from './matching';

const areas = [
  { searchText: '三山1～4丁目' },
  { searchText: '三山5～7丁目' },
  { searchText: '宮本1丁目' },
  { searchText: '中央①万町東本町西本町' },
];

describe('matchAreasByTowns', () => {
  it('matches all areas whose searchText contains the town', () => {
    expect(matchAreasByTowns(['三山'], areas).map((a) => a.searchText)).toEqual([
      '三山1～4丁目',
      '三山5～7丁目',
    ]);
  });
  it('matches a town embedded in address_detail (reverse lookup)', () => {
    expect(matchAreasByTowns(['万町'], areas)).toHaveLength(1);
  });
  it('normalizes the town before matching', () => {
    expect(matchAreasByTowns(['三 山'], areas)).toHaveLength(2);
  });
  it('returns empty when nothing matches', () => {
    expect(matchAreasByTowns(['存在しない町'], areas)).toEqual([]);
  });
  it('returns empty when towns list is empty or blank', () => {
    expect(matchAreasByTowns([''], areas)).toEqual([]);
  });
});
