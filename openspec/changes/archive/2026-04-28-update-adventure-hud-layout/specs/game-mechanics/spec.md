## ADDED Requirements

### Requirement: HUD derived level 與戰力不改變戰鬥規則
系統必須 (MUST) 讓 Adventure HUD 顯示的 derived Lv、HP、MP 與戰力只作為玩家判讀資訊，不改變正式戰鬥 resolver、經驗、境界或存檔規則。

#### Scenario: HUD 資訊只讀既有資料
- **WHEN** HUD 顯示 Lv、HP、MP 或戰力
- **THEN** 系統必須從既有 `character`、`inventory.equipmentStats` 與 combat stats helper 推導
- **AND** 不得因 HUD 顯示而改變實際戰鬥傷害、修煉收益或突破規則
