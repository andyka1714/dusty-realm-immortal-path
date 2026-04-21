## ADDED Requirements
### Requirement: 洞府百業支撐型成長循環
系統必須 (MUST) 讓 `聚靈陣 / 煉丹 / 煉器` 成為正式可迭代的當世成長循環，而不是僅剩單一卡片或 placeholder。

#### Scenario: Workshop 提供穩定成長底盤
- **WHEN** 玩家在洞府百業介面投入靈石、材料或 recipe 資源
- **THEN** 系統必須提供可驗證的聚靈、丹藥或煉器收益
- **AND** 這些收益必須能接回 cultivation、戰鬥 build 或資源循環

#### Scenario: 高境界乘區有對應來源
- **WHEN** 玩家進入 `化神 -> 仙帝` 的中後期循環
- **THEN** `丹藥 / 洞府` 必須承接對應乘區來源
- **AND** 不得讓高境界 multiplier 只存在於 audit table 而沒有對應玩法

### Requirement: 正式事件與奇遇循環
系統必須 (MUST) 將時間推進中的遭遇擴充為正式 event / encounter system，而不是只留下 flavor log。

#### Scenario: event 具有選項與結果
- **WHEN** 時間推進觸發事件或奇遇
- **THEN** 玩家必須看到可選擇的處理分支
- **AND** 每個選項都必須對應明確的收益、風險或資源結果

#### Scenario: event / encounter 承接路線差異
- **WHEN** 玩家處於不同境界、地圖路線或 build 節奏
- **THEN** 系統必須提供 route-specific 或 progression-sensitive 的事件差異
- **AND** 不得把所有奇遇都做成相同的純數值彈窗
