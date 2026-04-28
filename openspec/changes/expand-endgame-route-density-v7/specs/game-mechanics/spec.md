## ADDED Requirements

### Requirement: 終盤 route 必須提供 v7 repeatable aftermath
系統必須 (MUST) 讓已完成 `sect:*:endgame-loop-v4` 的三宗路線各自擁有 v7 repeatable aftermath。

#### Scenario: 三宗 v7 aftermath 可被 encounter selector 選到
- **WHEN** 玩家具備對應 `sect:*:endgame-loop-v4`
- **THEN** encounter selector 必須能選到該宗 v7 repeatable aftermath
- **AND** 每個 v7 事件必須提供 route、風險、收益與 memory cue
