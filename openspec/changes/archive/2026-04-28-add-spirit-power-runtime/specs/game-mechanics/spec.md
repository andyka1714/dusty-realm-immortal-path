## ADDED Requirements

### Requirement: Adventure 世界戰鬥必須追蹤玩家靈力 runtime
系統必須 (MUST) 在 Adventure 世界戰鬥中追蹤目前玩家靈力，讓主動術式消耗與補靈丹效果能形成閉環。

#### Scenario: 主動術式消耗靈力
- **WHEN** 玩家施放主動術式
- **THEN** 系統必須扣除對應靈力成本
- **AND** 靈力不足時必須阻擋施放，不得只靠 cooldown 或技能存在判斷
