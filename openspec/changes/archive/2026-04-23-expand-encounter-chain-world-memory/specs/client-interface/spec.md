## ADDED Requirements
### Requirement: 事件鏈與世界記憶提示
介面必須 (MUST) 讓玩家在 encounter 選擇前看懂該事件是否延續過去結果，或是否會留下後續記憶。

#### Scenario: Pending encounter 顯示 chain cue
- **WHEN** pending encounter 屬於事件鏈或引用世界記憶
- **THEN** 面板必須顯示可讀的 chain、route 或 consequence cue
- **AND** 不得只顯示內部事件 id 或要求玩家猜測後續影響
