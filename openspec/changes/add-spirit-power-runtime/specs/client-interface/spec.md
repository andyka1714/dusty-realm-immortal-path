## ADDED Requirements

### Requirement: Adventure HUD 必須顯示可見靈力 runtime
介面必須 (MUST) 在 Adventure 戰鬥中顯示目前靈力與最大靈力。

#### Scenario: 補靈丹恢復目前靈力
- **WHEN** 玩家在 Adventure 中使用 `heal_mp` 或 `full_restore` 補給
- **THEN** 介面必須更新目前靈力
- **AND** 若目前靈力已滿，補給必須顯示不可用或不消耗
