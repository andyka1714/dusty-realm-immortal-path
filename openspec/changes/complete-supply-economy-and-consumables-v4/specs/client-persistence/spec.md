## ADDED Requirements

### Requirement: 補給經濟 v4 不新增 persisted state
系統必須 (MUST) 讓補給品商店、恢復品 runtime 與 UI effect 文案只讀既有 item、inventory、character 與 adventure runtime state，避免為短期補給流程新增存檔負擔。

#### Scenario: 補給 v4 不新增 schema
- **WHEN** 系統顯示商店補給、背包補給、戰鬥快捷補給或恢復品不可用原因
- **THEN** 必須使用既有 `ITEMS`、`SHOPS`、inventory slots、character state 與當前可見 combat runtime resources
- **AND** 不得新增 LocalStorage envelope 欄位、補給使用 persisted queue 或新的 hydrated combat resource 欄位
