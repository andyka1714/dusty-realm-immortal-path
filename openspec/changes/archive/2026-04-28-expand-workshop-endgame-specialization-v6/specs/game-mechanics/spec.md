## ADDED Requirements

### Requirement: Workshop 終盤專精必須影響 endgame recipe cue
系統必須 (MUST) 讓 endgame specialization leaf 對終盤 recipe 顯示可讀影響，但不得跳過核心 route material。

#### Scenario: active specialization 影響終盤 recipe
- **WHEN** 玩家啟用 endgame specialization leaf 並查看對應 recipe
- **THEN** 系統必須顯示成本、熟練、品質或副產物 cue
- **AND** recipe 仍必須消耗對應 route material
