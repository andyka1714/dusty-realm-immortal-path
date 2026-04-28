## ADDED Requirements

### Requirement: 任務導向不得新增存檔狀態
任務追蹤導向必須 (MUST) 使用 runtime-only intent，不能新增 LocalStorage schema、hydrate shape 或 persisted catalog。

#### Scenario: 玩家點擊任務追蹤導向
- **WHEN** 任務追蹤發出導向目標
- **THEN** Adventure 可以在當前 runtime 移動或切換地圖
- **AND** 導向 intent 不得寫入 persisted state
