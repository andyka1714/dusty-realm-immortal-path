## ADDED Requirements
### Requirement: Adventure 常駐資源恢復
系統必須 (MUST) 在 Adventure runtime 中以低頻率週期恢復玩家目前氣血與靈力，且此恢復不得只限於脫離戰鬥後。

#### Scenario: 玩家在 Adventure 中受傷後等待恢復週期
- **WHEN** 玩家目前氣血低於最大氣血且 Adventure runtime 經過 5 秒恢復週期
- **THEN** 系統必須恢復玩家目前氣血
- **AND** 恢復量必須包含基本恢復、角色屬性加成與既有 `regenHp` 加成
- **AND** 目前氣血不得超過最大氣血

#### Scenario: 玩家在 Adventure 中消耗靈力後等待恢復週期
- **WHEN** 玩家目前靈力低於最大靈力且 Adventure runtime 經過 5 秒恢復週期
- **THEN** 系統必須恢復玩家目前靈力
- **AND** 恢復量必須包含基本恢復與角色屬性加成
- **AND** 目前靈力不得超過最大靈力

#### Scenario: 技能或丹藥提供持續恢復效果
- **WHEN** Adventure runtime 存在尚未過期的資源恢復效果
- **THEN** 系統必須在符合該效果週期時疊加額外氣血或靈力恢復
- **AND** 效果過期後不得繼續套用
