## ADDED Requirements

### Requirement: Content audit tools 不新增 persisted state
系統必須 (MUST) 讓 authoring audit 維持為 deterministic test/helper，不改變玩家存檔格式。

#### Scenario: Audit helper 不需要 migration
- **WHEN** 專案新增 content audit helper 或 regression
- **THEN** 既有 LocalStorage 存檔必須不需要 migration 或 hydrate sanitize
- **AND** 不得新增 runtime persisted field、LocalStorage key 或存檔版本分支
