# 千葉県60市町村 ごみ収集スケジュール検索 — 設計仕様

- 日付: 2026-06-21
- ステータス: 承認済み（実装プラン作成前）
- 対象リポジトリ: `made-for-x`（機能本体）/ `gomidata`（データ生成）

## 1. 目的

`made-for-x` の既存「船橋市ごみ収集スケジュール検索」を、`gomidata` が生成した
**千葉県60市町村**の収集データに置き換え、全市町村で住所別の収集日を検索できるようにする。

## 2. 背景と現状

### 既存（made-for-x）

- 船橋市のみ・**郵便番号7桁検索**
- DBモデル `WasteCollectionSchedule` は船橋専用の固定カラム（可燃×2日・不燃[第N週X曜]・資源・有価物の **4種別だけ**）
- シード元 `private/calendar-ready-garbage-data.json`（**gitignore** されており Vercel シードが脆い）
- UI: 4種別カード ＋ 各カードから Google カレンダー登録

### 新データ（gomidata）

- **60市町村 / 4,573地区**。`市町村 → areas[] → schedules[]` 構造
- 1スケジュール: `waste_type`(最大15種別)、`frequency`(weekly / biweekly / monthly / on_demand / scheduled)、
  `day_of_week[]`、`week_of_month[]`、`day_of_month[]`、`collection_dates[]`(ISO日付)、`collection_time`
- **郵便番号を持たない**（キーは地区名＝area_name + address_detail）

### 根本ギャップ

| 観点       | 既存(船橋)    | gomidata                   |
| ---------- | ------------- | -------------------------- |
| 検索キー   | 郵便番号      | 地区名（郵便番号なし）     |
| 対応       | 1市           | 60市町村                   |
| 種別       | 4固定カラム   | 最大15・可変               |
| タイミング | 週次/月次のみ | 週次/隔週/月次/随時/指定日 |

## 3. 検索 UX 設計（確定事項）

### 郵便番号は「町域」まで特定できる

`274-0072` → 船橋市**三山**（KEN_ALL: 郵便番号→町域は確実）。
難しいのは **町域 → ごみ地区** の対応で、地区名の形式により可否が分かれる:

| 地区名タイプ                          | 割合 | 町域→地区マッチ |
| ------------------------------------- | ---: | --------------- |
| 丁目つき（三山1丁目）                 |  28% | ◎ 町域名で一致  |
| 素の町名（三山・祇園・新生町）        |  64% | ◎ 町域名で一致  |
| 独自ラベル（区分1・コース・真亀丘上） |   6% | ✕ 町域と無関係  |

→ 約94%は郵便番号→町域→地区名マッチで到達。残り6%はフォールバック。

### 原則: 常に「show all」（選択UIを作らない）

- 郵便番号 → 町域 → その町域にマッチする**全地区をカード表示**（例: 三山→3丁目グループを全部出す）
- 1町域が複数地区に対応する場合も、ドロップダウンで選ばせず**全部並べる**。ユーザーは自分の丁目のカードを目で見る
- 町域がマッチしない市（区分1等）は、その市の**全地区**を表示（フォールバック）
- どの場合も上部に**町名フィルタ**（任意のさらなる絞り込み）

## 4. アーキテクチャ ＋ データパイプライン

```
gomidata (Python)                         made-for-x (Next.js)
─────────────────                         ────────────────────
60市 schedule JSON ─┐
                    ├─ export script ─→   prisma/data/waste/
KEN_ALL(郵便番号DB)─┘                        ├ chiba-waste-schedules.json
  千葉分を抽出                                └ chiba-postal-codes.json
                                                   │ seed
                                          Postgres (City / Area / PostalCode)
                                                   │
                                          /api/waste/lookup → UI
```

### gomidata が生成する2成果物

1. `chiba-waste-schedules.json` — 60市結合。各 area に正規化済み `searchText`（area_name + address_detail）を付与。
   構造: `[{ cityCode, cityName, prefecture, sourceUrl, areas: [{ areaName, addressDetail, searchText, schedules }] }]`
2. `chiba-postal-codes.json` — **KEN_ALL**（日本郵政の郵便番号→町域、無料・全国。出典 https://www.post.japanpost.jp/zipcode/dl/utf-zip.html ）を千葉60市分に絞ったもの。
   構造: `[{ zipcode, cityCode, townName }]`
   - 結合キー: KEN_ALLは5桁団体コード（12204）、gomidataは6桁（122041）。gomidata側で `city_id[:5]` 突合し6桁 `cityCode` を付与して出力。

### made-for-x 側

- 上記2ファイルを**リポジトリにコミット**（公開データのため可）。これで gitignore された `private/` 依存による Vercel シードの脆さも解消。
- 置き場所: `prisma/data/waste/`

## 5. DB スキーマ（Prisma / PostgreSQL）

```prisma
model City {
  id          Int          @id @default(autoincrement())
  cityCode    String       @unique          // "122041"
  name        String                         // "船橋市"
  prefecture  String                         // "千葉県"
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
  areaName      String                        // "三山 1～4丁目" / "中央①"
  addressDetail String?                        // "万町・東本町・…"
  searchText    String                         // 正規化: "三山1~4丁目"（マッチ用）
  schedules     Json                           // gomidata schedules[] をそのまま
  city          City     @relation(fields: [cityId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([cityId])
  @@map("waste_areas")
}

model PostalCode {
  id        Int    @id @default(autoincrement())
  zipcode   String                             // "2740072"（ハイフンなし7桁）
  cityId    Int
  townName  String                             // KEN_ALL町域 "三山"
  city      City   @relation(fields: [cityId], references: [id], onDelete: Cascade)
  @@index([zipcode])
  @@index([cityId])
  @@map("waste_postal_codes")
}
```

設計判断:

- 検索する次元（zipcode, cityId）のみ索引付き。`schedules` は**JSONでgomidataをそのまま保存**し、
  15種別・`collection_dates` 等の将来追加に無改修で追従。
- マッチは「cityId で Area 全取得 → アプリ側JSで `searchText` に町域名が含まれるか判定」。
  1市≤306件なので pg_trgm 等の部分一致索引は不要。
- 既存 `WasteCollectionSchedule`（船橋専用）は**削除**。船橋は gomidata 122041（306地区）から新モデルへ再投入。

## 6. 検索 / マッチングロジック

`normalize(s)`: 全角/半角スペース・区切り（`・,、`）除去、全角英数→半角、トリム。

ルックアップ:

```
1. PostalCode.findMany({ zipcode })            // 町域(複数可) + cityId
2. 空 → { status: 'not_found' }
3. towns = townName 群（「以下に掲載がない場合」等は除外）
4. areas = Area.findMany({ cityId })
5. matched = areas.filter(a => towns.some(t => a.searchText.includes(normalize(t))))
6. matched あり → { matchType:'town', areas: matched }
   なし         → { matchType:'city', areas: areas }   // フォールバック(全件)
```

- 部分一致のため「本町」が「東本町」に当たる等の軽い誤検出はありうるが、show-all 方針のため実害なし（取りこぼし防止を優先）。

## 7. API

新設 `GET /api/waste/lookup?zipcode=2740072`:

```json
{
  "success": true,
  "zipcode": "2740072",
  "city": { "cityCode": "122041", "name": "船橋市", "prefecture": "千葉県" },
  "towns": ["三山"],
  "matchType": "town",
  "areas": [
    {
      "areaName": "三山 1～4丁目",
      "addressDetail": null,
      "schedules": [
        {
          "wasteType": "burnable",
          "wasteTypeJa": "可燃ごみ",
          "frequency": "weekly",
          "dayOfWeek": ["火", "金"]
        }
      ]
    }
  ]
}
```

- 旧 `/api/search`（船橋専用）は廃止、または新エンドポイントへの薄いエイリアス。

## 8. UI

`src/components/WasteCollection/index.tsx` を拡張:

- 郵便番号入力 → `/api/waste/lookup`。`273`縛り注記と「船橋市のみ」バナーを撤去、千葉県60市町村対応に。
- ヘッダに「市 ＋ 町域」（例: 船橋市 三山）を表示。
- 返却された Area を**全部カード表示**、各 Area の**全 schedules を種別色チップ**で表示。
  整形は `fmtSchedule`（毎週/隔週/毎月第N週/毎月N日/指定日/申込制）。
- 上部に**町名フィルタ**（area_name + address_detail 対象。`matchType:'city'` 時に特に有用）。
- **Google カレンダー登録**を新タイミングへ拡張:
  - 毎週/隔週/毎月第N週曜日 → `RRULE`（既存踏襲。隔週は `INTERVAL=2`）
  - 毎月N日 → `RRULE:FREQ=MONTHLY;BYMONTHDAY=13,27`
  - 指定日（collection_dates / scheduled）→ **`.ics` ファイル生成**（全日付を VEVENT 化）
- SEO/メタデータ（現状船橋特化）を千葉県全域向けに一般化。

参照モック: `docs/mockups/waste-collection-mockup.html`（実データ5市入り・動作確認可）。

## 9. 移行 ・ シード ・ デプロイ

- Prisma マイグレーション: `waste_cities` / `waste_areas` / `waste_postal_codes` を追加、
  旧 `WasteCollectionSchedule` を削除（船橋は gomidata から再投入のため消えても問題なし）。
- `scripts/seed-database.ts` を**コミット済み2ファイル取り込み**へ書き換え（`db:seed` 名は維持 → `vercel.json` 無改修）。
- 旧 `private/calendar-ready-garbage-data.json` 依存を撤去。

## 10. テスト（Jest）

- 単体: `normalize()` ＋ マッチング（町域→Area、フォールバック、`万町→中央①` 逆引き）、
  `fmtSchedule` 全6モード、郵便番号正規化。
- API: `lookup` の town一致 / フォールバック / not_found。
- フィクスチャ: `273-0003→宮本`（CLAUDE.md 検証基準）/ `274-0072→三山`（複数丁目）/ `289-2144 (匝瑳市) → town not directly matched → city fallback shows all 14 匝瑳市 areas incl. 中央①`。

## 11. スコープ外 / フォローアップ

- **成田市の再抽出（gomidata側）**: `成田①②③④` は現状 `address_detail` が空で、ソースHTMLに存在する
  町名リスト（`公津（1）…八代、船形…`、`ニュータウン（1）…中台1丁目`）を取りこぼしている。
  町名を `address_detail` に取り込む再抽出で町域マッチ率が向上する。アーキテクチャの前提ではないため
  データ品質改善として別途実施（他の `address_detail` 空の市も同様に改善余地あり）。
- 他都道府県への拡張（スキーマは `prefecture` で拡張可能な設計）。
- 郵便番号の丁目単位精度（KEN_ALL が丁目別コードを持つ都市部はより細かく絞れる）。

## 12. 未決定（実装中に確定）

- 指定日（collection_dates）の Google カレンダー登録を **`.ics` 全日付**にするか「次回1件のみ」に簡素化するか。
  → 既定は `.ics` 全日付。簡素化が望ましければ次回1件に変更可。
