## ADDED Requirements

### Requirement: Mobile Adventure 必須提供可收合任務追蹤入口
介面必須 (MUST) 在 mobile viewport 提供低佔用任務追蹤入口，讓玩家可展開查看 active quests。

#### Scenario: Mobile 展開任務追蹤
- **WHEN** 玩家在 mobile viewport 點擊任務追蹤入口
- **THEN** 介面必須顯示 active quest 清單、類型、標題與進度文字
- **AND** 展開狀態不得新增 persisted pin state 或 tracked quest preference

#### Scenario: Mobile 收合任務追蹤不遮擋主要操作
- **WHEN** 任務追蹤處於收合狀態
- **THEN** 入口必須維持低佔用
- **AND** 不得遮擋底部 dock、action wheel、地圖 modal 或戰鬥目標卡主要操作
