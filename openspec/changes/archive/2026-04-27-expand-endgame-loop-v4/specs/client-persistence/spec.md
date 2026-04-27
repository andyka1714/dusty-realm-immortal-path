## ADDED Requirements

### Requirement: 終盤 v4 不新增 persisted schema
系統必須 (MUST) 讓終盤 v4 的 encounter chain、Workshop sink、輪迴 reward 與 UI cue 沿用既有 persisted shape，避免為短期內容串接新增 migration 負擔。

#### Scenario: v4 記憶沿用既有世界記憶
- **WHEN** v4 encounter 或輪迴 reward 需要保存終盤結果
- **THEN** 系統必須使用既有 `soul.worldMemoryTags`、`resolvedEventIds`、inventory、Workshop state 或 rebirth config
- **AND** 不得新增 LocalStorage envelope 欄位、`current` 子樹或新的 hydrate schema

#### Scenario: v4 catalog 擴量不需要 migration
- **WHEN** 新增 v4 encounter、recipe、item 或 reincarnation reward catalog entry
- **THEN** 舊存檔必須能透過既有 migration / sanitize path 正常載入
- **AND** 若沒有新增 persisted shape，tasks 與 tracking docs 必須明確記錄不需要 migration 的理由
