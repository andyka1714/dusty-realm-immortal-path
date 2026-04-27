## Context

`expand-sect-world-late-content-v3` 已新增三宗 v3 world chapter：

- `sect:sword:world-chapter-03`
- `sect:beast:world-chapter-03`
- `sect:mystic:world-chapter-03`

這些記憶目前已能由 encounter chain 寫入 `soul.worldMemoryTags`，且三種 route material 已存在：

- `sword_path_starsteel`
- `beast_path_bloodbone`
- `mystic_path_starlotus`

Workshop 已有 high-tier recipe、mastery milestone、specialization tree 與 UI cue。本 change 不重做 foundation，只把 v3 route memory 和既有 Workshop 系統接起來。

## Goals / Non-Goals

Goals:

- 讓高階 recipe metadata 明確追到 v3 route chapter memory。
- 讓 Workshop specialization leaf 或 effect cue 能辨識 v3 route source。
- 保持 route-specific material sink，不讓專精免除核心材料成本。
- UI 顯示 recipe source、route tag、memory cue 與 specialization effect。

Non-Goals:

- 不新增第二套 Workshop state。
- 不新增 persisted schema 或 migration。
- 不新增 quest engine、encounter engine 或圖鑑 source tracing 系統。
- 不要求所有舊 recipe 一次重寫；本輪聚焦 v3 route branch。

## Decisions

### Decision: 用 recipe metadata 承接 v3 memory

高階 recipe 新增或擴充 `routeTags`、`sourceHint`、`qualityHint` 與可測 metadata，讓 UI 和 tests 能驗證它們指向 `sect:*:world-chapter-03`。

Alternatives considered:

- 新增 recipe provenance persisted state：可追蹤更細，但會引入 migration；本輪不需要。
- 只更新文件不改資料：不足以讓 Workshop 實際承接 v3 內容。

### Decision: 用既有 world memory tag 作為 unlock/cue input

如果需要判斷 v3 route completion，讀取既有 `soul.worldMemoryTags`。不新增 Workshop-specific completion state。

Alternatives considered:

- 在 Workshop state 裡記錄 route unlock：會重複 existing soul memory，且增加 migration 風險。

### Decision: 專精效果可以增加品質 / 副收益 / mastery cue，但不得跳過材料 sink

Specialization leaf 可影響 `spiritStoneCostMultiplier`、`masteryYieldBonus`、`qualityCue`、`outputCue`，但 craft plan 的 `ingredients` 必須維持 recipe 原始 route-specific material cost。

## Risks / Trade-offs

- Risk: recipe branch 過度膨脹，導致 Workshop UI 變長。
  - Mitigation: 本輪只補三宗 v3 代表 branch，UI 只新增必要 cue。
- Risk: world memory cue 和 recipe unlock 混淆。
  - Mitigation: tests 明確檢查 source cue / routeTags；若不做硬 unlock，也要讓 UI 顯示來源與缺口。
- Risk: 誤新增 persisted field。
  - Mitigation: tasks 和 specs 明確標示 schema change 為 `no`，驗證時重跑 persistence 相關 gate。

## Migration Plan

No migration. This change only reads existing `soul.worldMemoryTags` and existing Workshop state, while adding catalog / recipe / UI metadata.

Rollback is a normal code revert; no persisted data cleanup is needed.
