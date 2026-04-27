## MODIFIED Requirements

### Requirement: 冒險與地圖內戰鬥 (Adventure & In-World Combat)
系統必須 (MUST) 提供網格地圖探索與地圖內時間軸戰鬥，而不是切換成舊式獨立回合制 modal。

#### Scenario: 地圖機制
- **WHEN** 玩家進入地圖
- **THEN** 系統必須根據 `MAPS` 資料生成地圖、傳送點、怪物與 Boss
- **AND** 地圖資料必須承接高境界內容密度、普通怪、精英怪與 Boss 配置

#### Scenario: 地圖內接戰
- **WHEN** 玩家或怪物在接戰範圍內發動普攻、技能或怪物特招
- **THEN** 戰鬥必須直接在 `Adventure` 場景內依 `attackRange / castRange / cooldownSeconds / castTimeMs / projectileSpeed / areaShape` 等資料解析
- **AND** 世界戰鬥、時間軸驗證與 replay 必須共用同一套 battle resolver 與 reward 流程

#### Scenario: 即時戰鬥怪物分工與前饋
- **WHEN** 玩家在地圖內與近戰、遠程、法術或 Boss 敵人接戰
- **THEN** 系統必須以不同站位、追擊、風箏、蓄力、危險區或投射物節奏表現怪物 archetype 差異
- **AND** 狀態、控制命中 / 免疫與危險區前饋必須沿用 battle core 語意，不得分裂為另一套規則

#### Scenario: 後期地圖提供本地內容 hook
- **WHEN** 玩家抵達 `劫雲荒原 (160)`、`接引仙殿 (170)` 或仙帝代表地圖
- **THEN** 地圖資料必須提供 route-agnostic local hook、profession 或 sect sensitive hook、Workshop material clue
- **AND** 這些 hook 必須透過既有 `NPC`、`Quest` 或 dialogue 資料承接，不得要求第二套地圖事件 runtime
