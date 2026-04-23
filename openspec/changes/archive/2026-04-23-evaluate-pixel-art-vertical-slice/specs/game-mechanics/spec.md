## ADDED Requirements
### Requirement: 像素風 prototype 必須保留 Adventure 語意
系統必須 (MUST) 讓像素風 vertical slice 承接現有 `Adventure` 的地圖與戰鬥語意，而不是另外做一套脫鉤的展示場景。

#### Scenario: 像素風場景沿用格子與地圖資料
- **WHEN** prototype 場景載入代表性地圖
- **THEN** 玩家、怪物、傳送門與目標 focus 必須沿用現有格子座標與地圖資料語意
- **AND** 不得為了畫面原型重寫另一套冒險資料結構

#### Scenario: 像素風場景保留 live combat cue 前饋
- **WHEN** 玩家在 prototype 場景中與近戰或遠程 / 法術怪接戰
- **THEN** 必須能看見近戰命中、投射物、危險區 telegraph 與 target / status cue
- **AND** 這些 cue 必須對應現有 live combat archetype，而不是脫離 battle core 另外命名
