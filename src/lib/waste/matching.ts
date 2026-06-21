// src/lib/waste/matching.ts
import { normalize } from './normalize';

export interface AreaLike {
  searchText: string;
}

export function matchAreasByTowns<T extends AreaLike>(towns: string[], areas: T[]): T[] {
  const norm = towns.map(normalize).filter(Boolean);
  if (norm.length === 0) return [];
  return areas.filter((a) => norm.some((t) => a.searchText.includes(t)));
}
