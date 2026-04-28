## ADDED Requirements

### Requirement: 核心非戰鬥屬性必須有可讀玩法效果
系統必須 (MUST) 讓悟性、福緣與魅力至少各自提供一個可被 UI 與 helper 讀取的 derived gameplay effect。

#### Scenario: 屬性效果由既有 attributes 推導
- **WHEN** 系統需要顯示或套用悟性、福緣、魅力效果
- **THEN** 必須從既有 `character.attributes` 推導修煉、突破、掉落、遭遇或商店互動加成
- **AND** 不得新增新的 persisted attribute effect state
