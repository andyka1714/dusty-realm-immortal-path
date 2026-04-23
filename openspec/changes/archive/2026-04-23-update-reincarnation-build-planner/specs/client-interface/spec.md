## ADDED Requirements

### Requirement: 主動坐化輪迴入口
系統必須 (MUST) 提供正式的 `主動坐化` 入口，讓玩家不必等到死亡才可結束本世並規劃下一世。

#### Scenario: 活著時主動進入輪迴流程
- **WHEN** 玩家仍存活且滿足正式門檻，並在 `Dashboard` 或等效正式入口選擇 `主動坐化`
- **THEN** 介面必須進入與死亡相同的 `Life Review -> Reincarnation Hall` 流程
- **AND** 本世結算必須把 `cause` 標記為 `voluntary`

### Requirement: Reincarnation Hall 正式 build planner
系統必須 (MUST) 讓 `Reincarnation Hall` 提供足夠的 planner 資訊，而不是只顯示最小成本摘要。

#### Scenario: 顯示進階 perk 與鎖定條件
- **WHEN** 玩家進入 `Reincarnation Hall`
- **THEN** 介面必須顯示目前可用與未解鎖的 perk 條目
- **AND** 對未解鎖條目必須顯示明確條件，而不是直接消失

#### Scenario: 顯示多格遺珍與起手預覽
- **WHEN** 玩家調整遺珍、魂印與靈根配置
- **THEN** 介面必須同步顯示可用遺珍格數、已選擇遺珍與起手加成預覽
- **AND** 若配置超出合法 slot 或功德預算，介面必須阻止確認
