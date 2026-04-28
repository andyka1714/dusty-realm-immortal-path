## ADDED Requirements

### Requirement: NPC 好感 state 必須有 migration 與 hydrate sanitize
LocalStorage persistence 必須 (MUST) 支援 NPC / sect affinity state 的 migration 與 hydrate sanitize，舊存檔載入時不得崩潰。

#### Scenario: 舊存檔沒有 affinity 欄位
- **WHEN** 系統載入舊版 LocalStorage save
- **THEN** hydrate 必須補上安全預設值
- **AND** migration regression 必須證明舊資料不會因缺少 affinity 欄位而破壞遊戲啟動
