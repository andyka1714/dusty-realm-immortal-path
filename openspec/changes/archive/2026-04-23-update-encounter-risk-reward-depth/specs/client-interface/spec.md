## ADDED Requirements

### Requirement: 事件選項必須讓玩家可讀地判斷風險與收益

系統必須 (MUST) 在 pending encounter 介面中，讓玩家在選擇前看懂事件類型、收益方向與代價差異，而不是只能閱讀一段抽象敘述。

#### Scenario: 面板顯示事件上下文

- **WHEN** `PendingEncounterPanel` 顯示正式 encounter
- **THEN** 介面必須呈現事件的類型、年份或其他關鍵上下文 cue
- **AND** 若事件屬於 profession、sect 或 route-specific pool，介面必須提供對應辨識資訊

#### Scenario: choice 顯示風險收益 cue

- **WHEN** 玩家檢視 encounter 的不同選項
- **THEN** 每個選項都必須提供足以判讀風險、成本或收益方向的 cue
- **AND** 不得讓玩家只能靠猜測理解哪個選項較穩健、較昂貴或較高風險
