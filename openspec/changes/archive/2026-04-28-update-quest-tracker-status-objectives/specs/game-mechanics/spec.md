## ADDED Requirements

### Requirement: 任務追蹤狀態必須由現有 runtime/state 推導
系統必須 (MUST) 從既有 quest definitions、active quests、completed quests、角色狀態與背包內容推導任務追蹤狀態，不得為 UI 狀態新增 persisted schema。

#### Scenario: 系統推導任務 lifecycle
- **WHEN** 任務尚未接受但符合主線前置條件
- **THEN** 任務追蹤可將它標示為可接取或下一主線
- **AND** 當 active quest 條件滿足時，任務追蹤必須將它標示為可回報
- **AND** 這些 UI 狀態不得寫入 LocalStorage
