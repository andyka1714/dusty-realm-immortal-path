## ADDED Requirements
### Requirement: Workshop 經濟與專精深化 v2
系統必須 (MUST) 讓 Workshop mastery、specialization leaf 與 route-specific material sink 形成中後期決策，而不是只提供扁平 recipe 製作。

#### Scenario: Mastery milestone 影響高階製作
- **WHEN** 玩家累積指定 discipline 的 mastery
- **THEN** 系統必須提供可驗證的 milestone、專精 leaf 或 recipe effect
- **AND** 不得只把 mastery 當成無回饋數值

#### Scenario: 專精效果不跳過材料 sink
- **WHEN** 玩家使用 specialization craft 高階 recipe
- **THEN** 專精可以影響品質、靈石、副產物或 mastery
- **AND** 不得繞過 recipe 指定的 route-specific 材料消耗
