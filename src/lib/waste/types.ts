// src/lib/waste/types.ts
export interface Schedule {
  wasteType: string;
  wasteTypeJa?: string | null;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'on_demand' | 'scheduled';
  dayOfWeek?: string[] | null;
  weekOfMonth?: number[] | null;
  dayOfMonth?: number[] | null;
  collectionDates?: string[] | null;
  collectionTime?: string | null;
}

export interface AreaResult {
  areaName: string;
  addressDetail?: string | null;
  searchText: string;
  schedules: Schedule[];
}

export interface CityResult {
  cityCode: string;
  name: string;
  prefecture: string;
}

export interface LookupResult {
  status: 'ok' | 'not_found' | 'invalid';
  city?: CityResult;
  towns?: string[];
  matchType?: 'town' | 'city';
  areas?: AreaResult[];
}
