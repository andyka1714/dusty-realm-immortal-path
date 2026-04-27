## ADDED Requirements

### Requirement: 宗門世界 v3 內容可發現性

介面必須 (MUST) 讓玩家能透過地圖 NPC、Quest modal、pending encounter 或圖鑑線索理解 v3 宗門 / 世界章節的入口、進度與結果。

#### Scenario: 地圖或任務顯示 v3 下一步

- **WHEN** 玩家符合 v3 宗門 / 世界章節條件
- **THEN** 介面必須顯示可互動 NPC、quest hook、pending encounter 或等效入口
- **AND** 玩家不得只能靠外部文件推測下一步去哪裡

#### Scenario: v3 route cue 在 encounter 或 quest 中可讀

- **WHEN** v3 milestone event、QuestModal 或 pending encounter 顯示
- **THEN** 介面必須顯示宗門、職業、風險收益或材料來源 cue
- **AND** 不得只顯示內部 id 或無路線差異的通用描述
