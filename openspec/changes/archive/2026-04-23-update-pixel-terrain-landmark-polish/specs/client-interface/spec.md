## ADDED Requirements
### Requirement: 像素地圖 landmark 與地景骨架
系統必須 (MUST) 讓正式 `AdventureStage` 的 terrain / background 像素語言呈現更清楚的 landmark、route skeleton、path corridor、Boss arena 與 hazard 差異，同時維持 actor token 呈現不變。

#### Scenario: 背景地景具備 route-specific 骨架
- **WHEN** 玩家進入不同 theme 或 route 的正式 Adventure 地圖
- **THEN** terrain / background 必須以 palette、semantic role 或 skeleton motif 顯示可辨識差異
- **AND** 不得讓不同高境界地圖全部退回相同 floorplan 與單一 detail pattern

#### Scenario: Actor token 不被像素化
- **WHEN** terrain landmark polish 套用到正式 AdventureStage
- **THEN** 玩家、怪物、NPC、角色文字 token、HUD 與 combat overlay 必須維持既有呈現
- **AND** 不得在這條 change 中改成 prototype 文字牌或 pixel sprite

