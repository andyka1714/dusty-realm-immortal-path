## ADDED Requirements

### Requirement: 終盤 route 必須有 v6 repeatable density
系統必須 (MUST) 讓已完成 `sect:*:endgame-loop-v4` 的三宗路線各自擁有 v6 repeatable aftermath。

#### Scenario: 三宗終盤 route 都有後續遭遇
- **WHEN** 玩家具備對應 `sect:*:endgame-loop-v4`
- **THEN** encounter selector 必須能選到該宗 v6 repeatable aftermath
- **AND** 每個事件必須提供 route、風險、收益與 memory cue
