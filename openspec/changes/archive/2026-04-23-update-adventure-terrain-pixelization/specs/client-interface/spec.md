## ADDED Requirements
### Requirement: 正式 Adventure terrain/background 像素化整合
系統必須 (MUST) 允許正式 `AdventureStage` 以像素化 terrain / background layer 呈現地圖主題，同時保留既有角色與戰鬥可讀性。

#### Scenario: 正式 Adventure 背景使用像素 terrain
- **WHEN** 玩家進入正式 `AdventureStage`
- **THEN** 系統必須顯示與 `mapData.theme` 對應的像素 terrain / background layer
- **AND** 不得只剩純黑底與單層格線作為唯一背景語言

#### Scenario: 正式 Adventure entity 表現維持現狀
- **WHEN** 正式 `AdventureStage` 套用像素 terrain 背景
- **THEN** 玩家、NPC、怪物、portal 與既有文字 avatar 必須維持現狀
- **AND** 不得把 prototype test page 的 entity token 直接推進到主流程

#### Scenario: 戰鬥 cue 在新背景上仍然可讀
- **WHEN** target marker、危險圈、投射物、狀態 cue 或其他 combat overlay 出現在像素 terrain 背景上
- **THEN** 它們必須保持清楚可辨
- **AND** 桌面與行動版都不得因背景整合而明顯降低可讀性
