## ADDED Requirements

### Requirement: 洞府百業支撐循環 (Workshop Support Loop)
系統必須 (MUST) 提供正式的 `Workshop` 支撐型成長循環，讓聚靈、煉丹與煉器成為可操作的 build 支撐來源。

#### Scenario: 聚靈陣升級
- **WHEN** 玩家在 `Workshop` 內升級聚靈陣
- **THEN** 系統必須檢查靈石成本並更新聚靈等級
- **AND** 成功升級後必須影響當世修煉效率或等效的支撐倍率

#### Scenario: 配方製作
- **WHEN** 玩家在 `Workshop` 內煉丹或煉器
- **THEN** 系統必須檢查配方解鎖、百業等級、靈石成本與材料消耗
- **AND** 成功施作後必須交付對應丹藥或裝備產出

### Requirement: 事件與奇遇選項流程 (Encounter Choice Flow)
系統必須 (MUST) 讓 yearly encounter 以正式選項流程承接，而不是只留下 flavor log。

#### Scenario: 年度遭遇浮現
- **WHEN** 時間推進觸發 encounter roll 且角色處於可遊玩 current run
- **THEN** 系統必須建立 pending encounter
- **AND** 正式流程必須在玩家解決遭遇前保留這筆 pending state

#### Scenario: 選項結果結算
- **WHEN** 玩家選擇 pending encounter 的某個分支
- **THEN** 系統必須結算對應修為、靈石、物品或等效收益
- **AND** 必須把該事件標記為已解決並清除 pending state

### Requirement: 宗門中期成長線 (Sect Midgame Progression)
系統必須 (MUST) 讓玩家在 `築基 -> 金丹` 中期階段擁有正式宗門任務與 NPC 成長承接，而不是只有入門一次性任務。

#### Scenario: 宗門中期 quest readiness
- **WHEN** 玩家完成宗門前置任務並與對應 NPC 互動
- **THEN** 系統必須根據 quest chain readiness 決定可接續的中期任務
- **AND** 不得讓錯誤 NPC 或未達條件的角色跳過任務鏈

#### Scenario: 宗門中期擊殺進度
- **WHEN** 玩家在中期宗門任務期間完成指定擊殺或對應目標
- **THEN** 系統必須更新 quest progress
- **AND** 任務完成後必須能交回對應 NPC 並承接下一段成長線
