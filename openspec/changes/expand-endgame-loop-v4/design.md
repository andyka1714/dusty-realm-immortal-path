## Context

前三輪已完成：

- `expand-encounter-content-density-v3`：補 `仙人 / 仙帝` encounter coverage 與 route-specific 可重複事件。
- `expand-encounter-route-aftermath-v3`：把三宗 v3 world memory 接成 repeatable aftermath 與 route material source。
- `update-workshop-route-source-specialization-v3`：讓 Workshop recipe card 顯示 route source、world memory cue 與 route-specific sink。
- `expand-route-memory-reincarnation-hooks-v3`：讓輪迴魂印讀取既有 `soul.worldMemoryTags`。
- `establish-content-authoring-audit-tools`：建立 item / quest / NPC / route material source tracing audit。

v4 的目標不是建立新結局系統或新存檔模型，而是用既有 event / memory / recipe / reincarnation 表面把終盤 loop 接起來。

## Goals

- 讓 `仙帝` route-specific chain 有明確 aftermath / convergence 記憶。
- 讓三種 route material 能在終盤 recipe 中形成清楚 sink。
- 讓輪迴大殿能讀取 v4 endgame memory 並呈現下一世 reward。
- 讓 UI 文案區分死亡輪迴、主動坐化、飛升/結局式收束與主動重開。
- 保持純前端、既有 state shape 與既有 migration 規則。

## Non-Goals

- 不新增後端、雲端存檔或 account system。
- 不新增多結局動畫、credits flow 或獨立 ending scene。
- 不新增新的 persisted state bucket。
- 不重寫 encounter selector、Workshop engine 或 reincarnation reducer。

## Technical Decisions

1. v4 終盤記憶沿用 `worldMemoryTags`
   - encounter reward 只新增可讀 tag，例如 `endgame:*:v4`。
   - 不新增 `endgameState` 或 `endingFlags`。

2. v4 Workshop sink 使用 catalog recipe
   - recipe 用現有 `WORKSHOP_RECIPES`、`routeTags`、`sourceHint`、`minRealm` 與 ingredient/output 結構。
   - 若需要新 output，必須同步進 `ITEMS` 與 source tracing audit。

3. v4 輪迴 reward 使用魂印 / perk catalog
   - 優先新增或擴充 `ReincarnationSeal` 類型資料，不改 rebirth flow state。
   - 解鎖條件讀 `soul.worldMemoryTags`，保持 sanitize 行為不變。

4. UI 語意先做可讀 cue，不做新流程
   - Dashboard 主動坐化入口與輪迴大殿 copy 顯示「本世收束 / 下一世規劃 / 不是死亡懲罰」。
   - 若已有 life review cause，可用現有 `cause === "voluntary"` 判斷文案。

## Risks

- 終盤 content 容易只加資料、不被測試覆蓋；必須讓 encounter、Workshop、reincarnation、source tracing 都有 targeted regression。
- 新 recipe 若新增 output item，可能造成 content audit 失敗；實作時先寫 failing tests 再補 catalog。
- UI 文案不能只在 snapshot 中出現，需讓 Playwright smoke 維持 mobile/desktop 不溢出。
