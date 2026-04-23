## ADDED Requirements
### Requirement: 像素地圖 production v2
系統必須 (MUST) 讓正式 `AdventureStage` 的 terrain/background 擁有可擴充的 biome、special terrain、landmark 與 route skeleton 語言，同時維持 actor token 不變。

#### Scenario: 地圖背景提供更清楚的 production language
- **WHEN** 玩家進入不同 biome 或 route skeleton 的地圖
- **THEN** 背景必須能透過 tile、landmark、special terrain 或 route motif 表現差異
- **AND** 不得退回只有通用方塊與格線

#### Scenario: Actor token 維持文字遊戲表現
- **WHEN** 像素地圖 production v2 套用到正式 Adventure
- **THEN** 玩家、NPC、怪物與角色 token 必須維持既有文字呈現
- **AND** 不得導入 prototype 用 pixel sprite 取代 actor token
