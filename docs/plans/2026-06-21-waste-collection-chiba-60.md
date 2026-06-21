# 千葉県60市町村 ごみ収集スケジュール検索 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Funabashi-only waste-collection lookup in `made-for-x` with `gomidata`'s 60-municipality Chiba dataset, searchable by postal code (zipcode → town → show all matching areas).

**Architecture:** `gomidata` (Python) exports two committed JSON artifacts (combined schedules + a Chiba postal→town map derived from Japan Post KEN_ALL). `made-for-x` (Next.js) seeds three Postgres tables (City / Area[+schedules JSON] / PostalCode) and serves `/api/waste/lookup`. Postal code resolves to a town (町域); the app matches that town against each area's normalized `searchText` and shows all matches (no selection UI); when nothing matches it falls back to showing all of the city's areas.

**Tech Stack:** Python 3.12 (gomidata export), Next.js 16 / React 18 / TypeScript, Prisma + PostgreSQL, Jest.

**Spec:** `docs/specs/2026-06-21-waste-collection-chiba-60-design.md`
**Mockup:** `docs/mockups/waste-collection-mockup.html`

**Conventions:** All commits use Conventional Commit prefixes and end with the trailer
`Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` (omitted from examples below for brevity). made-for-x work happens on branch `feat/waste-collection-chiba-60` (already created). Path alias `@/*` → `./src/*`.

**Deviations from spec (intentional, for a single source of truth):**

- `searchText` is computed in the made-for-x **seed** (TypeScript `normalize()`), NOT in gomidata. This keeps one normalization implementation, shared by seed and query time.
- `schedules` are stored as JSON with **camelCase** keys (mapped once at seed time from gomidata's snake_case), so the whole TS app stays camelCase-consistent.

---

## File Structure

**gomidata (Python):**

- Create `src/exporters/export_madeforx.py` — emits `data/exports/chiba-waste-schedules.json`
- Create `src/exporters/export_postal_codes.py` — downloads KEN_ALL, emits `data/exports/chiba-postal-codes.json`

**made-for-x (TypeScript):**

- Modify `prisma/schema.prisma` — add City/Area/PostalCode, remove WasteCollectionSchedule
- Create `prisma/data/waste/chiba-waste-schedules.json` + `chiba-postal-codes.json` (committed copies of the exports)
- Create `src/lib/waste/normalize.ts` + `.test.ts`
- Create `src/lib/waste/matching.ts` + `.test.ts`
- Create `src/lib/waste/schedule-format.ts` + `.test.ts`
- Create `src/lib/waste/calendar.ts` + `.test.ts`
- Create `src/lib/waste/lookup.ts` + `.test.ts`
- Create `src/lib/waste/types.ts` — shared TS types
- Rewrite `scripts/seed-database.ts`
- Create `src/app/api/waste/lookup/route.ts`
- Rewrite `src/components/WasteCollection/index.tsx`
- Modify `src/app/waste-collection/page.tsx` — metadata generalization
- Delete `src/app/api/search/route.ts`

---

## Phase 1 — gomidata exports

### Task 1: Export combined schedules JSON

**Files:**

- Create: `/Users/ryan/PycharmProjects/PythonProject/gomidata/src/exporters/export_madeforx.py`

- [ ] **Step 1: Write the exporter**

```python
"""Export all Chiba schedules into one made-for-x-ready file.

Output: data/exports/chiba-waste-schedules.json
[
  {"cityCode","cityName","prefecture","sourceUrl",
   "areas":[{"areaName","addressDetail","schedules":[<gomidata schedule verbatim>]}]}
]

searchText is intentionally NOT computed here — made-for-x's seed derives it
with its TypeScript normalize() so there is a single normalization impl.
"""
from __future__ import annotations
import json, glob
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SCHED_DIR = REPO / "data" / "schedules" / "chiba"
OUT = REPO / "data" / "exports" / "chiba-waste-schedules.json"


def main() -> int:
    cities = []
    for f in sorted(glob.glob(str(SCHED_DIR / "*.json"))):
        d = json.load(open(f, encoding="utf-8"))
        if "city_id" not in d:           # skip extraction_summary.json
            continue
        areas = []
        for a in d.get("areas", []):
            areas.append({
                "areaName": a.get("area_name") or "",
                "addressDetail": a.get("address_detail"),
                "schedules": a.get("schedules", []),
            })
        cities.append({
            "cityCode": d["city_id"],
            "cityName": d["city_name"],
            "prefecture": "千葉県",
            "sourceUrl": d.get("source_url"),
            "areas": areas,
        })
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(cities, ensure_ascii=False, indent=2), encoding="utf-8")
    total_areas = sum(len(c["areas"]) for c in cities)
    print(f"Wrote {OUT.relative_to(REPO)}: {len(cities)} cities, {total_areas} areas")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Run it**

Run: `cd /Users/ryan/PycharmProjects/PythonProject/gomidata && .venv/bin/python src/exporters/export_madeforx.py`
Expected: `Wrote data/exports/chiba-waste-schedules.json: 60 cities, 4573 areas`

- [ ] **Step 3: Sanity-check output**

Run:

```bash
.venv/bin/python -c "import json; d=json.load(open('data/exports/chiba-waste-schedules.json',encoding='utf-8')); a=d[0]['areas'][0]; print(d[0]['cityCode'], d[0]['cityName']); print(list(a.keys())); print(a['schedules'][0].keys())"
```

Expected: prints a cityCode like `121002 千葉市`, area keys `['areaName','addressDetail','schedules']`, schedule keys including `waste_type`, `frequency`, `day_of_week`.

- [ ] **Step 4: Commit (gomidata repo)**

```bash
git add src/exporters/export_madeforx.py data/exports/chiba-waste-schedules.json
git commit -m "feat(export): combined Chiba schedules for made-for-x"
```

### Task 2: Export Chiba postal→town map from KEN_ALL

**Files:**

- Create: `/Users/ryan/PycharmProjects/PythonProject/gomidata/src/exporters/export_postal_codes.py`

- [ ] **Step 1: Write the exporter**

```python
"""Derive a Chiba postal→town map from Japan Post KEN_ALL.

Downloads utf_ken_all.zip (UTF-8), keeps rows whose 5-digit JIS code maps to
one of our 60 Chiba city_ids (city_id[:5]), and emits:
  data/exports/chiba-postal-codes.json  -> [{"zipcode","cityCode","townName"}]

Town cleaning: drop parenthetical notes; blank out non-geographic notes
("以下に掲載がない場合" etc.) so they fall through to the city-wide fallback.
"""
from __future__ import annotations
import csv, io, json, re, urllib.request, zipfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CITIES = REPO / "data" / "cities" / "chiba.json"
RAW = REPO / "data" / "raw" / "ken_all" / "utf_ken_all.zip"
OUT = REPO / "data" / "exports" / "chiba-postal-codes.json"
KEN_ALL_URL = "https://www.post.japanpost.jp/zipcode/dl/utf/zip/utf_ken_all.zip"

NOTE_MARKERS = ("以下に掲載がない場合", "の次に番地がくる場合", "一円", "場合")


def _ensure_zip() -> Path:
    if RAW.exists() and RAW.stat().st_size > 100000:
        return RAW
    RAW.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(KEN_ALL_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        RAW.write_bytes(r.read())
    return RAW


def _clean_town(town: str) -> str:
    town = re.sub(r"（.*?）", "", town)        # full-width parens
    town = re.sub(r"\(.*?\)", "", town)        # half-width parens
    if any(m in town for m in NOTE_MARKERS):
        return ""
    return town.strip()


def main() -> int:
    cities = json.load(open(CITIES, encoding="utf-8"))
    jis5_to_code = {c["city_id"][:5]: c["city_id"] for c in cities}

    zpath = _ensure_zip()
    rows = []
    with zipfile.ZipFile(zpath) as z:
        csv_name = next(n for n in z.namelist() if n.lower().endswith(".csv"))
        with z.open(csv_name) as fh:
            reader = csv.reader(io.TextIOWrapper(fh, encoding="utf-8"))
            seen = set()
            for row in reader:
                jis5, zip7, town = row[0], row[2], row[8]
                code = jis5_to_code.get(jis5)
                if not code:
                    continue
                t = _clean_town(town)
                key = (zip7, t)
                if key in seen:
                    continue
                seen.add(key)
                rows.append({"zipcode": zip7, "cityCode": code, "townName": t})

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    zips = {r["zipcode"] for r in rows}
    print(f"Wrote {OUT.relative_to(REPO)}: {len(rows)} rows, {len(zips)} unique zipcodes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

- [ ] **Step 2: Run it**

Run: `cd /Users/ryan/PycharmProjects/PythonProject/gomidata && .venv/bin/python src/exporters/export_postal_codes.py`
Expected: `Wrote data/exports/chiba-postal-codes.json: <N> rows, <M> unique zipcodes` (N in the thousands).

- [ ] **Step 3: Verify the validation fixtures resolve**

Run:

```bash
.venv/bin/python -c "import json; d=json.load(open('data/exports/chiba-postal-codes.json',encoding='utf-8')); m={r['zipcode']:r for r in d}; print(m.get('2730003')); print(m.get('2740072')); print([r for r in d if r['zipcode']=='2740072'])"
```

Expected: `2730003` → 船橋市 宮本-ish town; `2740072` → 船橋市 三山. (If townName differs slightly, that's fine — matching is substring-based.)

- [ ] **Step 4: Commit (gomidata repo)**

```bash
git add src/exporters/export_postal_codes.py data/exports/chiba-postal-codes.json
git commit -m "feat(export): Chiba postal→town map from KEN_ALL"
```

Note: `data/raw/` is gitignored in gomidata, so the downloaded zip is not committed — only the derived JSON.

### Task 3: Copy artifacts into made-for-x

**Files:**

- Create: `made-for-x/prisma/data/waste/chiba-waste-schedules.json`
- Create: `made-for-x/prisma/data/waste/chiba-postal-codes.json`

- [ ] **Step 1: Copy both files**

Run:

```bash
mkdir -p /Users/ryan/WebstormProjects/made-for-x/prisma/data/waste
cp /Users/ryan/PycharmProjects/PythonProject/gomidata/data/exports/chiba-waste-schedules.json \
   /Users/ryan/PycharmProjects/PythonProject/gomidata/data/exports/chiba-postal-codes.json \
   /Users/ryan/WebstormProjects/made-for-x/prisma/data/waste/
```

- [ ] **Step 2: Confirm not gitignored**

Run: `cd /Users/ryan/WebstormProjects/made-for-x && git check-ignore prisma/data/waste/chiba-waste-schedules.json && echo IGNORED || echo OK`
Expected: `OK`

- [ ] **Step 3: Commit (made-for-x repo)**

```bash
git add prisma/data/waste/
git commit -m "chore(waste): add Chiba 60-city schedule + postal data"
```

---

## Phase 2 — Prisma schema & migration (made-for-x)

### Task 4: Replace WasteCollectionSchedule with City/Area/PostalCode

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Remove the old model**

Delete the entire `model WasteCollectionSchedule { ... }` block (lines defining it, currently `prisma/schema.prisma:14-35`) including its `@@index` lines.

- [ ] **Step 2: Add the three new models**

Append to `prisma/schema.prisma`:

```prisma
model City {
  id          Int          @id @default(autoincrement())
  cityCode    String       @unique
  name        String
  prefecture  String
  sourceUrl   String?
  areas       Area[]
  postalCodes PostalCode[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([prefecture])
  @@map("waste_cities")
}

model Area {
  id            Int      @id @default(autoincrement())
  cityId        Int
  areaName      String
  addressDetail String?
  searchText    String
  schedules     Json
  city          City     @relation(fields: [cityId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([cityId])
  @@map("waste_areas")
}

model PostalCode {
  id       Int    @id @default(autoincrement())
  zipcode  String
  cityId   Int
  townName String
  city     City   @relation(fields: [cityId], references: [id], onDelete: Cascade)

  @@index([zipcode])
  @@index([cityId])
  @@map("waste_postal_codes")
}
```

- [ ] **Step 3: Create the migration**

Run: `cd /Users/ryan/WebstormProjects/made-for-x && npm run db:migrate -- --name waste_collection_chiba_60`
Expected: Prisma creates `prisma/migrations/<ts>_waste_collection_chiba_60/migration.sql` containing `DROP TABLE "WasteCollectionSchedule"` and `CREATE TABLE "waste_cities" / "waste_areas" / "waste_postal_codes"`. Prisma Client regenerates.

- [ ] **Step 4: Verify client types exist**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep -i wasteCollectionSchedule || echo "no stale refs in TS yet"`
Expected: references will still exist in `src/app/api/search` and the old seed — those are fixed in later tasks. Note them; do not fix here.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(db): waste City/Area/PostalCode schema, drop WasteCollectionSchedule"
```

---

## Phase 3 — Shared libraries (TDD)

### Task 5: `normalize()`

**Files:**

- Create: `src/lib/waste/normalize.ts`
- Test: `src/lib/waste/normalize.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { normalize } from './normalize';

describe('normalize', () => {
  it('strips spaces (half and full width)', () => {
    expect(normalize('三山 1丁目')).toBe('三山1丁目');
    expect(normalize('三山　1丁目')).toBe('三山1丁目');
  });
  it('strips separators', () => {
    expect(normalize('万町・東本町、西本町')).toBe('万町東本町西本町');
  });
  it('converts full-width alphanumerics to half-width', () => {
    expect(normalize('Ａ１２３')).toBe('A123');
  });
  it('keeps circled numbers and kanji untouched', () => {
    expect(normalize('中央①')).toBe('中央①');
  });
  it('handles empty/nullish', () => {
    expect(normalize('')).toBe('');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/lib/waste/normalize.test.ts`
Expected: FAIL — cannot find module `./normalize`.

- [ ] **Step 3: Implement**

```typescript
// src/lib/waste/normalize.ts
export function normalize(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/[\s　]/g, '')
    .replace(/[・,、，]/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .trim();
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/lib/waste/normalize.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/waste/normalize.ts src/lib/waste/normalize.test.ts
git commit -m "feat(waste): normalize() for town/area matching"
```

### Task 6: `matchAreasByTowns()`

**Files:**

- Create: `src/lib/waste/matching.ts`
- Test: `src/lib/waste/matching.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/lib/waste/matching.test.ts`
Expected: FAIL — cannot find module `./matching`.

- [ ] **Step 3: Implement**

```typescript
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/lib/waste/matching.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/waste/matching.ts src/lib/waste/matching.test.ts
git commit -m "feat(waste): matchAreasByTowns() town→area matching"
```

### Task 7: Shared types + `formatSchedule()`

**Files:**

- Create: `src/lib/waste/types.ts`
- Create: `src/lib/waste/schedule-format.ts`
- Test: `src/lib/waste/schedule-format.test.ts`

- [ ] **Step 1: Write the types**

```typescript
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
```

- [ ] **Step 2: Write the failing test**

```typescript
import { formatSchedule } from './schedule-format';
import type { Schedule } from './types';

const base: Schedule = { wasteType: 'burnable', frequency: 'weekly' };

describe('formatSchedule', () => {
  it('weekly', () => {
    expect(formatSchedule({ ...base, dayOfWeek: ['月', '木'] })).toBe('毎週 月・木');
  });
  it('biweekly', () => {
    expect(formatSchedule({ ...base, frequency: 'biweekly', dayOfWeek: ['水'] })).toBe('隔週 水');
  });
  it('monthly by nth weekday', () => {
    expect(
      formatSchedule({ ...base, frequency: 'monthly', dayOfWeek: ['木'], weekOfMonth: [2] })
    ).toBe('毎月 第2 木');
  });
  it('monthly by day of month', () => {
    expect(formatSchedule({ ...base, frequency: 'monthly', dayOfMonth: [13, 27] })).toBe(
      '毎月 13日・27日'
    );
  });
  it('scheduled explicit dates', () => {
    expect(
      formatSchedule({
        ...base,
        frequency: 'scheduled',
        collectionDates: ['2026-06-08', '2026-12-07'],
      })
    ).toBe('指定日 6/8・12/7');
  });
  it('on_demand', () => {
    expect(formatSchedule({ ...base, frequency: 'on_demand' })).toBe('申込制');
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx jest src/lib/waste/schedule-format.test.ts`
Expected: FAIL — cannot find module `./schedule-format`.

- [ ] **Step 4: Implement**

```typescript
// src/lib/waste/schedule-format.ts
import type { Schedule } from './types';

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

export function formatSchedule(s: Schedule): string {
  const dow = (s.dayOfWeek ?? []).join('・');
  switch (s.frequency) {
    case 'weekly':
      return `毎週 ${dow}`;
    case 'biweekly':
      return `隔週 ${dow}`;
    case 'monthly':
      if (s.dayOfMonth && s.dayOfMonth.length) {
        return `毎月 ${s.dayOfMonth.map((d) => `${d}日`).join('・')}`;
      }
      if (s.collectionDates && s.collectionDates.length) {
        const head = s.collectionDates.slice(0, 4).map(fmtDate).join('・');
        return `指定日 ${head}${s.collectionDates.length > 4 ? '…' : ''}`;
      }
      if (s.weekOfMonth && s.weekOfMonth.length) {
        return `毎月 ${s.weekOfMonth.map((w) => `第${w}`).join('・')} ${dow}`;
      }
      return `毎月 ${dow}`;
    case 'scheduled':
      return `指定日 ${(s.collectionDates ?? []).map(fmtDate).join('・')}`;
    case 'on_demand':
      return '申込制';
    default:
      return dow || '—';
  }
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx jest src/lib/waste/schedule-format.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/waste/types.ts src/lib/waste/schedule-format.ts src/lib/waste/schedule-format.test.ts
git commit -m "feat(waste): schedule types + formatSchedule()"
```

### Task 8: Calendar export (RRULE + ICS)

**Files:**

- Create: `src/lib/waste/calendar.ts`
- Test: `src/lib/waste/calendar.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { buildRecurrenceRule, buildIcs } from './calendar';
import type { Schedule } from './types';

describe('buildRecurrenceRule', () => {
  it('weekly → WEEKLY by day', () => {
    const s: Schedule = { wasteType: 'burnable', frequency: 'weekly', dayOfWeek: ['月', '木'] };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=WEEKLY;BYDAY=MO,TH');
  });
  it('biweekly → WEEKLY interval 2', () => {
    const s: Schedule = { wasteType: 'x', frequency: 'biweekly', dayOfWeek: ['水'] };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=WE');
  });
  it('monthly nth weekday → MONTHLY BYDAY with ordinal', () => {
    const s: Schedule = {
      wasteType: 'x',
      frequency: 'monthly',
      dayOfWeek: ['木'],
      weekOfMonth: [2],
    };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=MONTHLY;BYDAY=2TH');
  });
  it('monthly by day of month → MONTHLY BYMONTHDAY', () => {
    const s: Schedule = { wasteType: 'x', frequency: 'monthly', dayOfMonth: [13, 27] };
    expect(buildRecurrenceRule(s)).toBe('RRULE:FREQ=MONTHLY;BYMONTHDAY=13,27');
  });
  it('explicit-date schedules have no recurrence rule', () => {
    const s: Schedule = { wasteType: 'x', frequency: 'scheduled', collectionDates: ['2026-06-08'] };
    expect(buildRecurrenceRule(s)).toBeNull();
  });
});

describe('buildIcs', () => {
  it('emits one VEVENT per collection date', () => {
    const ics = buildIcs('電池類収集', ['2026-06-08', '2026-12-07']);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260608');
    expect(ics).toContain('DTSTART;VALUE=DATE:20261207');
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2);
    expect(ics.trim().endsWith('END:VCALENDAR')).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/lib/waste/calendar.test.ts`
Expected: FAIL — cannot find module `./calendar`.

- [ ] **Step 3: Implement**

```typescript
// src/lib/waste/calendar.ts
import type { Schedule } from './types';

const JP_TO_RRULE_DAY: Record<string, string> = {
  月: 'MO',
  火: 'TU',
  水: 'WE',
  木: 'TH',
  金: 'FR',
  土: 'SA',
  日: 'SU',
};

export function buildRecurrenceRule(s: Schedule): string | null {
  const days = (s.dayOfWeek ?? []).map((d) => JP_TO_RRULE_DAY[d]).filter(Boolean);
  switch (s.frequency) {
    case 'weekly':
      return days.length ? `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')}` : null;
    case 'biweekly':
      return days.length ? `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${days.join(',')}` : null;
    case 'monthly':
      if (s.dayOfMonth && s.dayOfMonth.length) {
        return `RRULE:FREQ=MONTHLY;BYMONTHDAY=${s.dayOfMonth.join(',')}`;
      }
      if (s.weekOfMonth && s.weekOfMonth.length && days.length) {
        const byday = s.weekOfMonth.flatMap((w) => days.map((d) => `${w}${d}`)).join(',');
        return `RRULE:FREQ=MONTHLY;BYDAY=${byday}`;
      }
      return null;
    default:
      return null; // scheduled / on_demand → use ICS or no recurrence
  }
}

export function buildIcs(title: string, isoDates: string[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//madeforx//waste//JA'];
  isoDates.forEach((iso, i) => {
    const ymd = iso.replace(/-/g, '');
    lines.push(
      'BEGIN:VEVENT',
      `UID:waste-${ymd}-${i}@madeforx.com`,
      `SUMMARY:${title}`,
      `DTSTART;VALUE=DATE:${ymd}`,
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/lib/waste/calendar.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/waste/calendar.ts src/lib/waste/calendar.test.ts
git commit -m "feat(waste): calendar RRULE + ICS builders for all timing modes"
```

---

## Phase 4 — Seed script

### Task 9: Rewrite `seed-database.ts`

**Files:**

- Modify (replace contents): `scripts/seed-database.ts`

- [ ] **Step 1: Replace the file**

```typescript
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
  const cities: RawCity[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'chiba-waste-schedules.json'), 'utf-8')
  );
  const postals: RawPostal[] = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'chiba-postal-codes.json'), 'utf-8')
  );

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
```

- [ ] **Step 2: Run the seed against the dev database**

Run: `cd /Users/ryan/WebstormProjects/made-for-x && npm run db:seed`
Expected: `✅ Seeded: 60 cities, 4573 areas, <thousands> postal rows`

- [ ] **Step 3: Spot-check in the DB**

Run:

```bash
npx tsx -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); (async()=>{const r=await p.postalCode.findMany({where:{zipcode:'2740072'},include:{city:true}}); console.log(r.map(x=>[x.city.name,x.townName])); await p.\$disconnect();})()"
```

Expected: `[['船橋市','三山']]` (or similar 三山 town).

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-database.ts
git commit -m "feat(waste): seed City/Area/PostalCode from committed JSON"
```

---

## Phase 5 — Lookup lib + API

### Task 10: `lookupByZipcode()`

**Files:**

- Create: `src/lib/waste/lookup.ts`
- Test: `src/lib/waste/lookup.test.ts`

- [ ] **Step 1: Write the failing test (mocked prisma)**

```typescript
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/lib/waste/lookup.test.ts`
Expected: FAIL — cannot find module `./lookup`.

- [ ] **Step 3: Implement**

```typescript
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
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/lib/waste/lookup.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/waste/lookup.ts src/lib/waste/lookup.test.ts
git commit -m "feat(waste): lookupByZipcode() zipcode→town→areas"
```

### Task 11: API route `/api/waste/lookup`

**Files:**

- Create: `src/app/api/waste/lookup/route.ts`

- [ ] **Step 1: Implement the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { lookupByZipcode } from '@/lib/waste/lookup';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const zipcode = new URL(request.url).searchParams.get('zipcode') ?? '';
    const result = await lookupByZipcode(prisma, zipcode);

    if (result.status === 'invalid') {
      return NextResponse.json(
        { success: false, message: '郵便番号の形式が正しくありません（7桁の数字）' },
        { status: 400 }
      );
    }
    if (result.status === 'not_found') {
      return NextResponse.json(
        { success: false, message: 'この郵便番号に対応する地域が見つかりませんでした' },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      zipcode: zipcode.replace(/\D/g, ''),
      city: result.city,
      towns: result.towns,
      matchType: result.matchType,
      count: result.areas!.length,
      areas: result.areas!.map((a) => ({
        areaName: a.areaName,
        addressDetail: a.addressDetail ?? null,
        schedules: a.schedules,
      })),
    });
  } catch (error) {
    console.error('waste lookup error:', error);
    return NextResponse.json(
      { success: false, message: 'サーバー内部エラーが発生しました' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Manually verify against the dev server**

Run (in one terminal): `npm run dev`
Run (in another): `curl -s 'http://localhost:3000/api/waste/lookup?zipcode=2740072' | npx json5 2>/dev/null || curl -s 'http://localhost:3000/api/waste/lookup?zipcode=2740072'`
Expected: JSON with `"city":{"name":"船橋市"...}`, `"matchType":"town"`, and `areas` containing 三山 entries with camelCase schedules.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/waste/lookup/route.ts
git commit -m "feat(api): /api/waste/lookup endpoint"
```

---

## Phase 6 — UI

### Task 12: Rewrite the WasteCollection component

**Files:**

- Rewrite: `src/components/WasteCollection/index.tsx`

- [ ] **Step 1: Replace the component**

```tsx
'use client';

import React, { useMemo, useState, FormEvent } from 'react';
import { Calendar, MapPin, Trash2, Search } from 'lucide-react';
import { formatSchedule } from '@/lib/waste/schedule-format';
import { buildRecurrenceRule, buildIcs } from '@/lib/waste/calendar';
import type { Schedule } from '@/lib/waste/types';

interface Area {
  areaName: string;
  addressDetail?: string | null;
  schedules: Schedule[];
}
interface LookupResponse {
  success: boolean;
  zipcode: string;
  city: { cityCode: string; name: string; prefecture: string };
  towns: string[];
  matchType: 'town' | 'city';
  count: number;
  areas: Area[];
}

const WT_COLOR: Record<string, string> = {
  burnable: 'bg-red-50 text-red-800 border-red-200',
  non_burnable: 'bg-blue-50 text-blue-800 border-blue-200',
  recyclable: 'bg-green-50 text-green-800 border-green-200',
  pet_bottles: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  bottles: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  cans: 'bg-gray-50 text-gray-800 border-gray-200',
  metals: 'bg-slate-50 text-slate-800 border-slate-200',
  paper: 'bg-amber-50 text-amber-800 border-amber-200',
  cardboard: 'bg-orange-50 text-orange-800 border-orange-200',
  plastic: 'bg-purple-50 text-purple-800 border-purple-200',
  hazardous: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  valuables: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  clothing: 'bg-pink-50 text-pink-800 border-pink-200',
  branches: 'bg-lime-50 text-lime-800 border-lime-200',
  large_waste: 'bg-stone-50 text-stone-800 border-stone-200',
};

function nextWeekday(jpDay: string): Date {
  const map: Record<string, number> = { 日: 0, 月: 1, 火: 2, 水: 3, 木: 4, 金: 5, 土: 6 };
  const target = map[jpDay] ?? 1;
  const today = new Date();
  let delta = target - today.getDay();
  if (delta <= 0) delta += 7;
  const d = new Date(today);
  d.setDate(today.getDate() + delta);
  return d;
}
function ymd(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function exportSchedule(area: Area, s: Schedule, cityName: string) {
  const title = `${s.wasteTypeJa ?? s.wasteType}収集 - ${area.areaName}`;
  const dates = s.collectionDates ?? [];
  // Explicit-date schedules → downloadable .ics with every date.
  if (
    (s.frequency === 'scheduled' || (s.frequency === 'monthly' && dates.length)) &&
    dates.length
  ) {
    const ics = buildIcs(title, dates);
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${s.wasteType}-${area.areaName}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  // Recurring → Google Calendar template URL with RRULE.
  const recur = buildRecurrenceRule(s);
  const start = nextWeekday((s.dayOfWeek ?? ['月'])[0]);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  const params = new URLSearchParams({
    text: title,
    dates: `${ymd(start)}/${ymd(end)}`,
    details: `${formatSchedule(s)}\n地域: ${area.areaName}, ${cityName}`,
    location: `${area.areaName}、${cityName}`,
  });
  if (recur) params.append('recur', recur);
  window.open(
    `https://calendar.google.com/calendar/render?action=TEMPLATE&${params.toString()}`,
    '_blank'
  );
}

const WasteCollectionForm = () => {
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<LookupResponse | null>(null);
  const [filter, setFilter] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const zip = zipcode.replace(/\D/g, '');
    if (zip.length !== 7) {
      setError('正しい郵便番号を入力してください（7桁の数字）');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    setFilter('');
    try {
      const res = await fetch(`/api/waste/lookup?zipcode=${zip}`);
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.message || 'データの取得に失敗しました');
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const visibleAreas = useMemo(() => {
    if (!data) return [];
    const q = filter.trim();
    if (!q) return data.areas;
    return data.areas.filter((a) => `${a.areaName}${a.addressDetail ?? ''}`.includes(q));
  }, [data, filter]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-6 rounded">
          <p className="font-medium">千葉県全60市町村に対応しています</p>
          <p className="text-sm">郵便番号で市町村を特定し、地域別の収集日を表示します。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label htmlFor="zipcode" className="block text-gray-700 text-sm font-bold mb-2">
            郵便番号を入力:
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              id="zipcode"
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              className="w-full pl-10 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="例: 274-0072 または 2740072"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-5 h-5" />
            <span>{loading ? '読み込み中...' : '収集日程を確認'}</span>
          </button>
        </form>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="border-b pb-3 mb-3">
              <h2 className="text-xl font-semibold text-gray-800">
                {data.city.name}
                {data.towns.length > 0 && (
                  <span className="text-gray-500 text-base"> {data.towns.join('・')}</span>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {data.matchType === 'city'
                  ? `郵便番号では市までの特定です。下の欄に町名を入れて絞り込めます（全${data.areas.length}地区）。`
                  : `${data.count}件の地域が見つかりました。`}
              </p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="町名で絞り込む 例: 三山 / 万町"
                className="w-full pl-10 p-2 border rounded-md text-gray-900"
              />
            </div>

            {visibleAreas.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                該当する地区がありません。町名の一部だけ入れてみてください。
              </p>
            ) : (
              <div className="space-y-4">
                {visibleAreas.map((area, idx) => (
                  <div key={`${area.areaName}-${idx}`} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900">{area.areaName}</h3>
                    {area.addressDetail && (
                      <p className="text-xs text-gray-500 mb-2">{area.addressDetail}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {area.schedules.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => exportSchedule(area, s, data.city.name)}
                          title="カレンダーに追加"
                          className={`text-left px-3 py-2 rounded-lg border ${
                            WT_COLOR[s.wasteType] ?? 'bg-gray-50 text-gray-800 border-gray-200'
                          }`}
                        >
                          <span className="block text-xs font-bold">
                            {s.wasteTypeJa ?? s.wasteType}
                          </span>
                          <span className="block text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatSchedule(s)}
                            {s.collectionTime === 'nighttime' ? ' (夜)' : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WasteCollectionForm;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: no errors from `src/components/WasteCollection/index.tsx`.

- [ ] **Step 3: Manual smoke test**

With `npm run dev` running, open `http://localhost:3000/waste-collection`, enter `274-0072`.
Expected: header shows 「船橋市 三山」, three 三山 cards appear, typing 「三山8」 in the filter narrows to one; entering `289-2144` then filtering 「万町」 shows 中央①.

- [ ] **Step 4: Commit**

```bash
git add src/components/WasteCollection/index.tsx
git commit -m "feat(waste): multi-city UI with town filter + all waste types"
```

### Task 13: Generalize page metadata/SEO

**Files:**

- Modify: `src/app/waste-collection/page.tsx`

- [ ] **Step 1: Update metadata + structured data to Chiba-wide**

In `src/app/waste-collection/page.tsx`, replace Funabashi-specific copy:

- `metadata.title` → `'千葉県ごみ収集スケジュール検索 - 市町村・住所別収集日確認'`
- `metadata.description` → `'千葉県全60市町村のごみ収集スケジュールを郵便番号から検索。燃やすごみ、資源ごみ、ペットボトル等の収集日を地域別に確認できます。'`
- `metadata.keywords` → replace 船橋-only entries with `['千葉県','ごみ収集','ゴミ出し','収集日','ごみカレンダー','燃やすごみ','資源ごみ','千葉']`
- `ServiceStructuredData` `name`/`description`/`areaServed` → Chiba-wide (`areaServed={['千葉県','Chiba','Japan']}`)
- `BreadcrumbStructuredData` second item name → `'千葉県ごみ収集スケジュール'`
- FAQ_ITEMS: change Q2 answer to “千葉県全60市町村に対応しています。”; keep others, replacing 船橋市 mentions with 千葉県.

- [ ] **Step 2: Type-check + lint**

Run: `npx tsc --noEmit -p tsconfig.json && npm run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/waste-collection/page.tsx
git commit -m "feat(waste): generalize SEO/metadata to Chiba prefecture"
```

---

## Phase 7 — Cleanup & verification

### Task 14: Remove old endpoint + verify whole feature

**Files:**

- Delete: `src/app/api/search/route.ts`
- Check: any imports of the removed route or `wasteCollectionSchedule`

- [ ] **Step 1: Confirm nothing imports the old search route or model**

Run:

```bash
cd /Users/ryan/WebstormProjects/made-for-x
grep -rn "api/search" src || echo "no refs to api/search"
grep -rn "wasteCollectionSchedule" src scripts || echo "no refs to old model"
```

Expected: no references (the component now uses `/api/waste/lookup`; seed was rewritten). If any remain, update them to the new endpoint/model before deleting.

- [ ] **Step 2: Delete the old route**

Run: `git rm src/app/api/search/route.ts`
(If a test exists at `src/app/api/search/__tests__`, `git rm` it too.)

- [ ] **Step 3: Full test suite**

Run: `npm test`
Expected: all suites pass, including the new `src/lib/waste/*.test.ts`.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds (Prisma generate + Next build), no type errors, `/api/waste/lookup` and `/waste-collection` compile.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(waste): remove Funabashi-only search route"
```

- [ ] **Step 6: Open a PR**

Run:

```bash
git push -u origin feat/waste-collection-chiba-60
gh pr create --title "千葉県60市町村 ごみ収集スケジュール検索" --body "Replaces the Funabashi-only lookup with gomidata's 60-city Chiba dataset (zipcode→town→show all). See docs/specs/2026-06-21-waste-collection-chiba-60-design.md."
```

---

## Self-Review notes

- **Spec coverage:** §4 pipeline → Tasks 1–3; §5 schema → Task 4; §6 matching → Tasks 5–6, 10; §7 API → Task 11; §8 UI (render, filter, calendar) → Tasks 7–8, 12–13; §9 migration/seed → Tasks 4, 9, 14; §10 tests → Tasks 5–8, 10. All covered.
- **Deviations** (searchText in seed; camelCase schedules) are documented in the header and implemented consistently in Task 9 (`toCamel`, `normalize`) and consumed in Tasks 7/8/10/12 (camelCase types).
- **Type consistency:** `Schedule` (camelCase) defined in Task 7 `types.ts`; used identically in `schedule-format.ts`, `calendar.ts`, `lookup.ts`, the component, and produced by the seed's `toCamel`. `matchAreasByTowns`/`normalize`/`lookupByZipcode`/`buildRecurrenceRule`/`buildIcs`/`formatSchedule` names are stable across tasks.
- **Out of scope:** 成田 re-extraction (gomidata data-quality follow-up) is intentionally not in this plan; tracked separately.
