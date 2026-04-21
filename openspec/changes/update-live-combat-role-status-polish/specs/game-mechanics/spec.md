## ADDED Requirements
### Requirement: 即時戰鬥怪物分工與狀態可讀性
系統必須 (MUST) 在地圖內即時戰鬥中，為不同怪物分工提供可辨識的行為節奏，並讓狀態與控制結果維持和 battle core 一致的可讀性。

#### Scenario: 不同怪物 archetype 具有可辨識的戰鬥節奏
- **WHEN** 玩家在地圖內與近戰、遠程、法術或 Boss 敵人接戰
- **THEN** 系統必須以明確不同的站位、追擊、蓄力或危險區節奏表現這些 archetype
- **AND** 不得把所有敵人都退化成相同的貼臉追擊或相同的出手提示

#### Scenario: 控制與狀態提示沿用 battle core 語意
- **WHEN** 即時戰鬥中發生暈眩、冰凍、放逐、易傷、護盾、控制免疫或其他 formal status 結果
- **THEN** live-combat 提示必須沿用 battle core 已有的 status 語意
- **AND** world / timeline / replay 的結果敘事不可分裂成互相矛盾的三套規則

#### Scenario: 蓄力、免疫與危險區有明確前饋
- **WHEN** 敵人準備施放特招、控制被免疫或危險區即將生效
- **THEN** 系統必須在命中前或事件發生時提供清楚的前饋提示
- **AND** 玩家不必只靠戰鬥日誌回推發生了什麼
