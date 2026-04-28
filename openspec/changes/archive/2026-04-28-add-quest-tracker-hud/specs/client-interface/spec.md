## ADDED Requirements

### Requirement: Adventure 主畫面必須提供任務追蹤 HUD
介面必須 (MUST) 在 Adventure 主畫面提供 derived 任務追蹤欄，讓玩家不需要離開主場景就能讀到目前主要任務進度。

#### Scenario: 顯示 active quest 進度
- **WHEN** 玩家有 active quest
- **THEN** 任務追蹤 HUD 必須顯示任務類型、標題、進度或可回報狀態
- **AND** 任務排序必須優先顯示可回報任務、主線、宗門任務，再顯示其他任務

#### Scenario: 沒有 active quest
- **WHEN** 玩家沒有 active quest
- **THEN** 任務追蹤 HUD 必須顯示低佔用 empty state
- **AND** 不得新增 persisted pin state 或 tracked quest preference
