## MODIFIED Requirements

### Requirement: 輪迴 build diversity 存檔承接
系統必須 (MUST) 讓舊版 soul save 能安全載入輪迴 v2 / v3 catalog，並清理不合法 planner 配置。

#### Scenario: 舊存檔缺少新 catalog 選項
- **WHEN** 玩家載入不含 v2 或 v3 perk、魂印或 planner 欄位的舊存檔
- **THEN** migration 必須補齊安全預設值或沿用既有欄位
- **AND** 不得讓 Reincarnation Hall 因欄位缺失崩潰

#### Scenario: v3 route memory hooks 不新增 persisted state
- **WHEN** Reincarnation v3 只新增 soul seal / perk catalog、requiredWorldMemoryTags 或 UI cue
- **THEN** 系統必須沿用既有 `soul.worldMemoryTags` 與 `rebirthConfig`
- **AND** 不需要新增 migration 或 hydration sanitize
