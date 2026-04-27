## MODIFIED Requirements

### Requirement: 輪迴 build diversity v2
系統必須 (MUST) 讓輪迴後的新一世 build 能依玩家前世路線、魂印、perk 與遺珍形成可辨識差異。

#### Scenario: route memory 解鎖魂印
- **WHEN** 玩家前世留下 route-specific world memory
- **THEN** Reincarnation planner 必須能用該記憶解鎖對應 build identity 的魂印或 perk
- **AND** 缺少記憶時不得讓對應魂印可選

#### Scenario: v3 route memory 解鎖高階轉世 cue
- **WHEN** 玩家留下 `sect:sword:world-chapter-03`、`sect:beast:world-chapter-03` 或 `sect:mystic:world-chapter-03`
- **THEN** Reincarnation planner 必須提供對應劍修、體修或法修的高階魂印 / perk cue
- **AND** 該 cue 必須維持 lane-specific heirloom constraint
- **AND** 不得新增第二套 soul memory state
