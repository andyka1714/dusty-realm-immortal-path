# Change: 擴張宗門與世界後段內容 v3

## Why

`expand-sect-world-route-chapters-v2` 已把三宗後段內容延伸到跨地圖 route chapter，但目前 v3 backlog 仍要求更多 map-local NPC、milestone event 與後段職業分歧。`expand-encounter-content-density-v3` 已補終盤 encounter density，下一步應讓宗門 / 世界章節也承接到更後段，不只停在既有 chapter_02。

## What Changes

- 延長三宗後段章節鏈，補更多 `合體 -> 仙人 / 仙帝` 區間的世界承接點。
- 補 map-local NPC、quest hook、milestone event 或 pending encounter，讓玩家知道下一步去哪裡。
- 補三宗 route-specific 後段差異，讓凌霄劍宗、萬獸山莊、縹緲仙宮在後段不只換名。
- 確認與已完成的 encounter v3、Workshop route materials、world memory tag 能接上。

## Impact

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/quests.ts`
  - `data/maps.ts`
  - `data/encounters.ts`
  - `data/sectLateProgression.test.ts`
  - `data/sectWorldStoryBranch.test.ts`
  - `data/encounters.test.ts`
  - `docs/02_Gameplay/sect-world.md`
  - `docs/03_World/story.md`
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Persisted State / Migration

- Schema change? `no`
- Persisted surface: existing quest completion ids、encounter resolved ids、soul world memory tags；不新增欄位。
- Migration / hydration sanitize: not needed，新增 quest / NPC / encounter id 由既有資料結構承接；不得改名既有 id。
- Regression coverage: quest progression、map-local NPC discoverability、encounter gating、world memory / route material cue。
