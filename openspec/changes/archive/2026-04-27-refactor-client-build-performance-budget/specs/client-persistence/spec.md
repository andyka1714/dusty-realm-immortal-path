## ADDED Requirements

### Requirement: Build budget 不新增 persisted state
系統必須 (MUST) 讓 build budget 與 lazy-loading 調整不改變存檔格式。

#### Scenario: Build / lazy boundary 調整不需要 migration
- **WHEN** 專案調整 Vite chunk budget、manual chunks 或 query-gated lazy import
- **THEN** 既有 LocalStorage 存檔必須不需要 migration 或 hydrate sanitize
- **AND** 不得新增 persisted field、LocalStorage key 或存檔版本分支
