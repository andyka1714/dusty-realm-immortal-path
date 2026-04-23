## MODIFIED Requirements
### Requirement: 冒險與戰鬥 (Adventure & Combat)
系統必須 (MUST) 提供由單一 battle core 驅動的網格地圖探索、場景內即時戰鬥、時間軸模擬驗證與舊戰報 replay，且高境界 (`SpiritSevering -> ImmortalEmperor`) 的內容密度、普通怪掉落主題與後段門檻必須可被持續驗證。

#### Scenario: 地圖機制
- **WHEN** 進入地圖
- **THEN** 根據 `MAPS` 資料生成網格 (Block-based Design)
- **AND** 生成怪物：普通怪根據地形名稱生成
- **AND** 生成 Boss：固定座標生成，掉落突破道具

#### Scenario: 高境界內容密度
- **WHEN** 玩家進入 `SpiritSevering` 以上的大境界
- **THEN** 每個大境界必須提供主線圖之外的額外壓力圖或精英圖
- **AND** 不得讓高境界 progression 長期維持「每境界幾乎只剩兩張圖」的壓縮狀態

#### Scenario: 高境界普通怪掉落主題
- **WHEN** 玩家在 `SpiritSevering` 以上的大境界刷普通怪
- **THEN** 掉落池必須採用主題混融子池，而不是直接掉整包全混池
- **AND** 不同區域仍應保留偏劍 / 偏體 / 偏法或三界混融的辨識度

#### Scenario: 後段門檻維持
- **WHEN** 使用後段同境界 build-ready 裝備與技能挑戰同境界 Boss
- **THEN** 三職業都應可通關
- **AND** 擊殺節奏仍需維持劍修最快、法修次之、體修最穩但最慢

#### Scenario: 跨境界挑戰門檻
- **WHEN** 使用同一套 build-ready 後段角色挑戰高一個大境界的 Boss
- **THEN** 不應形成三職業都能穩定通關的狀態
- **AND** regression tests 必須固定這個門檻
