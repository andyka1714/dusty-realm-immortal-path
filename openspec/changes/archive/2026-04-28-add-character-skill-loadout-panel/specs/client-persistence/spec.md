## ADDED Requirements

### Requirement: 裝備主動功法必須安全持久化
LocalStorage persistence 必須 (MUST) 支援角色目前裝備的主動功法，並在舊存檔或非法資料載入時安全 fallback。

#### Scenario: 舊存檔沒有裝備功法欄位
- **WHEN** 系統載入缺少 `equippedActiveSkillId` 的舊存檔
- **THEN** hydrate 必須補上 `null`
- **AND** 非字串或未學功法 id 必須在 reducer / 戰鬥選招階段安全 fallback
