## ADDED Requirements

### Requirement: 初期主線必須串接功法取得 loop
遊戲資料必須 (MUST) 提供一條早期主線，讓玩家在入門前知道可透過藏經閣取得功法秘卷，並在背包參悟後到功法面板裝備。

#### Scenario: 玩家接觸藏經閣主線
- **WHEN** 玩家向藏經閣 NPC 接取早期主線
- **THEN** 任務對話必須說明秘卷購買、背包參悟與功法裝備
- **AND** 任務完成不得新增 persisted schema
