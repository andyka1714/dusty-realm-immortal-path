## ADDED Requirements
### Requirement: 輪迴 build diversity v2
系統必須 (MUST) 讓輪迴配置提供可辨識的下一世 build 方向，而不是只提供泛用數值加成。

#### Scenario: 下一世 build 具有策略辨識
- **WHEN** 玩家在輪迴大殿選擇 perk、魂印或遺珍
- **THEN** 系統必須能形成可辨識的 build identity
- **AND** 不得讓所有合法配置只剩相同的泛用成長倍率

#### Scenario: 跨世資訊不污染 current run
- **WHEN** 輪迴 v2 使用 lifetime stats 或 world memory 作為 planner 參考
- **THEN** 系統必須只讀取合法的 soul / memory 摘要
- **AND** 不得把上一世背包、任務或地圖狀態帶入新一世
