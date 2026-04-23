## ADDED Requirements

### Requirement: 宗門中期成長線必須延伸到金丹階段

系統 MUST 為玩家已加入的宗門提供不只入門試煉，而是能從 `築基` 推進到 `金丹` 的正式任務承接。

#### Scenario: 已加入宗門的玩家可接續宗門中期任務

- **WHEN** 玩家已完成任一宗門的加入任務與第一個宗門試煉
- **THEN** 系統必須提供該宗門後續的中期任務鏈
- **AND** 該鏈至少要承接 `築基` 與 `金丹` 兩個階段

### Requirement: 宗門中期任務必須維持路線專屬辨識

系統 MUST 讓劍宗、獸莊、仙宮的中期任務在 NPC、目標或獎勵上維持清楚的職業路線差異。

#### Scenario: 不同宗門的中期任務不應退化成同模板換名字

- **WHEN** 玩家比較不同宗門的中期任務鏈
- **THEN** 系統必須在 quest giver、任務敘事、目標 boss 或獎勵配置上提供明確差異
- **AND** 不得讓三宗中期內容只剩相同模板的名稱替換

### Requirement: 宗門中期內容不得依賴新的 quest engine 形狀

系統 MUST 能在現有 quest 資料結構與互動流程下承接宗門中期內容，而不是把內容補量綁定在新的 quest engine overhaul 上。

#### Scenario: 宗門中期任務可在既有 quest 流程中成立

- **WHEN** 開發者新增宗門中期任務
- **THEN** 任務必須能透過現有 `giverId`、`submitNpcId`、`prerequisiteQuestId` 與簡單 requirement 組合完成
- **AND** 不得要求新的多分支或多條件 completion model 才能上線
