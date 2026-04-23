## ADDED Requirements
### Requirement: Persistence migration release gate
系統必須 (MUST) 在任何改動 persisted state 的正式 change 中定義 migration、hydration 與 regression gate。

#### Scenario: Change 新增 persisted state
- **WHEN** 新功能新增 current run、soul、encounter、workshop 或其他 LocalStorage 欄位
- **THEN** 該 change 必須提供舊存檔預設值補齊或清理策略
- **AND** 必須有 regression 證明舊存檔不會因缺欄位崩潰

#### Scenario: Change 不新增 persisted state
- **WHEN** 新功能只改資料表、UI cue 或 deterministic helper
- **THEN** tasks 必須明確記錄不需要 migration 的理由
- **AND** 不得在未宣告的情況下偷渡新 persisted field
