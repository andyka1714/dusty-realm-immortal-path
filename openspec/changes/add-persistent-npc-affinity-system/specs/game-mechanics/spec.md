## ADDED Requirements

### Requirement: NPC / sect 好感必須可持續累積
系統必須 (MUST) 記錄玩家與 NPC 或 sect 的長期 affinity，並讓任務、對話、商店或 route memory 能調整該值。

#### Scenario: 玩家行為調整 affinity
- **WHEN** 玩家完成會影響 NPC 或 sect 的任務、對話或商店互動
- **THEN** 系統必須調整對應 affinity state
- **AND** deterministic 魅力 / 職業 baseline 必須保留為額外來源，不得被 persisted affinity 完全取代
