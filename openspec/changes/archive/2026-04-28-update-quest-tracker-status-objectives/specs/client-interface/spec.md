## ADDED Requirements

### Requirement: 任務追蹤卡片必須區分 lifecycle 狀態
介面必須 (MUST) 在任務追蹤卡片中清楚區分可接取、進行中、可回報與下一主線狀態，避免玩家無法判斷任務是尚未接受、正在進行或可以完成。

#### Scenario: 玩家查看任務追蹤卡片
- **WHEN** 任務追蹤顯示任務
- **THEN** 卡片必須顯示任務 lifecycle badge
- **AND** 可接取、進行中、可回報、下一主線不得只共用同一種文案或顏色語意

### Requirement: 任務追蹤必須顯示多目標進度列
介面必須 (MUST) 支援對話、討伐、提交物品、境界與複合任務的目標摘要與進度列。

#### Scenario: 任務具有多個條件
- **WHEN** 任務 requirements 包含多個條件
- **THEN** 任務追蹤必須逐列顯示每個目標類型與進度
- **AND** 主要導向仍必須指向下一個可行目標

#### Scenario: 任務需要提交物品
- **WHEN** 任務 requirement 為 item
- **THEN** 卡片必須顯示目前持有數量與需求數量

#### Scenario: 任務需要擊敗怪物
- **WHEN** 任務 requirement 為 kill
- **THEN** 卡片必須顯示目前擊殺進度與需求數量

#### Scenario: 任務需要對話或境界
- **WHEN** 任務 requirement 為 dialogue 或 level
- **THEN** 卡片必須顯示可讀的目標說明，而不是只顯示泛用進行中文字
