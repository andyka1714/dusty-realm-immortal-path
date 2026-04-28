## ADDED Requirements

### Requirement: NPC 態度與商店折扣必須可由既有資料推導
系統必須 (MUST) 從魅力、宗門身份、完成任務或 world memory 推導 deterministic NPC 態度與商店折扣。

#### Scenario: 商店價格套用 deterministic 折扣
- **WHEN** 玩家與商店 NPC 互動
- **THEN** 系統必須能推導折扣比例與來源文字
- **AND** 不得新增每個 NPC 的 persisted affinity state
