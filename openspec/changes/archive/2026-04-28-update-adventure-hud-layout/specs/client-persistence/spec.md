## ADDED Requirements

### Requirement: HUD 佈局調整不新增 persisted state
系統必須 (MUST) 讓 Adventure HUD 佈局、dock 入口與 action wheel 調整維持純 UI / derived state，不新增 LocalStorage schema。

#### Scenario: Change 不需要 migration
- **WHEN** 系統新增 HUD 顯示欄位、dock 入口或 action wheel UI state
- **THEN** 既有存檔必須不需要 migration、hydrate sanitize 或 schemaVersion 變更
- **AND** 不得新增 persisted HUD preference、derived level、combat power 或 map modal 欄位
