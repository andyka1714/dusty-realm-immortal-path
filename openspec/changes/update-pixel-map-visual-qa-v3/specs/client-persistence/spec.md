## MODIFIED Requirements

### Requirement: Persistence migration release gate
系統必須 (MUST) 在任何改動 persisted state 的正式 change 中定義 migration、hydration 與 regression gate。

#### Scenario: 新 persisted field 必須宣告
- **WHEN** change 新增或改動 LocalStorage envelope、`current`、`character`、`inventory`、`soul`、`workshop` 或其他 persisted state
- **THEN** proposal / design / tasks 必須標示 schema change
- **AND** 必須提供 migration 或 hydrate sanitize 策略

#### Scenario: UI-only 或 catalog-derived change 必須宣告 no migration
- **WHEN** change 只調整 UI、測試、文件或由既有 catalog 推導資料
- **THEN** tasks 必須明確記錄不需要 migration 的理由
- **AND** 不得在未宣告的情況下偷渡新 persisted field

#### Scenario: Pixel map visual QA v3 不新增 persisted state
- **WHEN** pixel map visual QA v3 只新增 terrain QA helper、regression、Playwright smoke 或文件
- **THEN** 系統必須沿用既有 map metadata、Adventure runtime 與 LocalStorage envelope
- **AND** 不得新增新的 persisted map visual state、actor sprite state 或 hydrate migration
