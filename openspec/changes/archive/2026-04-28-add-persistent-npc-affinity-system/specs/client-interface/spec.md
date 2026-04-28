## ADDED Requirements

### Requirement: NPC 與商店介面必須顯示持續性好感
介面必須 (MUST) 在 NPC / Quest / Shop 互動中顯示目前 affinity 等級、近期變化原因與折扣來源。

#### Scenario: 玩家打開商店或 NPC 任務
- **WHEN** 玩家打開 ShopPanel 或 QuestModal
- **THEN** 介面必須顯示 persisted affinity 與 deterministic baseline 的合併結果
- **AND** 折扣或任務提示必須能說明來源
