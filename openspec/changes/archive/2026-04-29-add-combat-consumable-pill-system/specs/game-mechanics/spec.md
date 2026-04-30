## ADDED Requirements

### Requirement: 恢復丹藥必須共用戰鬥補給冷卻
系統必須 (MUST) 讓所有帶有 `heal_hp` 或 `heal_mp` 效果的丹藥在地圖內戰鬥共用 5 秒冷卻；本階段正式丹藥不得發布 `full_restore` 效果。

#### Scenario: 玩家連續服用恢復丹藥
- **WHEN** 玩家剛服用回血丹、回靈丹或混合恢復丹
- **THEN** 5 秒內不得再服用任何恢復丹藥
- **AND** 冷卻結束後才可再次手動或自動服丹

### Requirement: 丹藥資料必須按用途與境界分層
系統必須 (MUST) 提供可追蹤的修為丹、回血丹、回靈丹、混合恢復丹、破境輔助丹、戰鬥增益丹與壽元 / 特殊丹資料。

#### Scenario: 系統載入丹藥 catalog
- **WHEN** 系統檢查正式丹藥資料
- **THEN** 每個低中境界丹藥都必須存在於 item catalog
- **AND** 每個丹藥必須具備正式效果與至少一個商店、煉丹或掉落來源

### Requirement: 大境界晉階物必須由對應 Boss 掉落
系統必須 (MUST) 讓每個大境界突破所需的晉階物可由對應境界 Boss 掉落。

#### Scenario: 玩家準備衝擊下一個大境界
- **WHEN** Dashboard 需要 `BREAKTHROUGH_CONFIG.requiredItemId`
- **THEN** 該物品必須存在於 catalog
- **AND** 必須至少有一個同境界 Boss 掉落該晉階物
- **AND** Boss 掉落系統必須保證 Boss drop table 中的突破物會掉落

### Requirement: 自動服丹必須依資源缺口選擇補給
系統必須 (MUST) 在玩家開啟自動服丹時，依氣血與靈力缺口選擇可用恢復丹藥並消耗背包數量。

#### Scenario: 氣血或靈力低於設定閾值
- **WHEN** 玩家在地圖內戰鬥且資源低於自動服丹閾值
- **THEN** 系統必須在恢復丹藥冷卻結束時自動選擇合適丹藥
- **AND** 成功恢復後必須扣除一顆丹藥並寫入日誌
- **AND** 若沒有可用丹藥或資源已滿，不得扣除道具
