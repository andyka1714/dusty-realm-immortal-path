## ADDED Requirements

### Requirement: Map local content v3 不新增 persisted state
系統必須 (MUST) 讓後期地圖本地內容擴充維持在靜態資料與既有 quest/NPC state 之內，不為 clue 或 rumor 新增新的存檔 shape。

#### Scenario: 新增 local hook 不需要 migration
- **WHEN** 系統新增後期地圖 local NPC、rumor quest 或 Workshop material clue
- **THEN** 既有存檔必須能在不執行 migration 的情況下讀取新 catalog
- **AND** 不得新增新的 LocalStorage key、persisted field 或 hydrate sanitize 分支
