## ADDED Requirements

### Requirement: 戰力與妖獸情報不新增 persisted state
系統必須 (MUST) 讓戰力估算與妖獸情報顯示沿用既有 character stats、enemy catalog 與 map catalog，不新增 LocalStorage schema。

#### Scenario: Change 不需要 migration
- **WHEN** 系統新增戰力 helper、妖獸圖鑑情報或 Adventure 目標卡情報
- **THEN** 既有存檔必須不需要 migration、hydrate sanitize 或 schemaVersion 變更
- **AND** 不得新增 persisted combat power、玩家圖鑑進度或妖獸情報快取欄位
