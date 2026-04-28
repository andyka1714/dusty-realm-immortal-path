## ADDED Requirements

### Requirement: NPC / sect 好感必須可持續累積
系統必須 (MUST) 記錄玩家與 NPC 或 sect 的長期 affinity，並讓任務、對話、商店或 route memory 能調整該值。

#### Scenario: 玩家行為調整 affinity
- **WHEN** 玩家完成會影響 NPC 或 sect 的任務、對話或商店互動
- **THEN** 系統必須調整對應 affinity state
- **AND** deterministic 魅力 / 職業 baseline 必須保留為額外來源，不得被 persisted affinity 完全取代

## MODIFIED Requirements

### Requirement: NPC 態度與商店折扣必須可由既有資料推導
系統必須 (MUST) 從魅力、宗門身份、完成任務、world memory 與 persisted NPC / sect affinity 合併推導 NPC 態度與商店折扣。

#### Scenario: 商店價格套用合併後的折扣
- **WHEN** 玩家與商店 NPC 互動
- **THEN** 系統必須能推導折扣比例與來源文字
- **AND** deterministic 魅力 / 職業 / 宗門功績來源不得被 persisted affinity 取代
- **AND** persisted NPC / sect affinity 必須以增量方式影響態度與折扣
