## ADDED Requirements

### Requirement: Workshop 專精與材料來源可讀性
Workshop 介面必須 (MUST) 讓玩家看懂專精解鎖條件、目前可否切換與高階材料來源。

#### Scenario: 顯示專精鎖定與切換資訊
- **WHEN** 玩家進入 Workshop 並查看 `Alchemy / Smithing` 專精
- **THEN** 介面必須顯示目前專精、可選專精、鎖定原因與切換成本
- **AND** 不得只顯示一個無條件可點擊的效果名稱

#### Scenario: 顯示高階材料來源 cue
- **WHEN** 玩家查看高階 recipe 或 route-specific material requirement
- **THEN** 介面必須提供來源、route 或 encounter cue
- **AND** 玩家必須能判斷該材料與哪條世界 / 宗門 / 奇遇路線相關
