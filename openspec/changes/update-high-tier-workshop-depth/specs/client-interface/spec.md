## ADDED Requirements
### Requirement: 高階 Workshop 可讀性
系統必須 (MUST) 在 Workshop 介面清楚呈現高階 recipe 的鎖定條件、材料來源、品質預期與專精收益，讓玩家能理解百業深度而不是只看到不可點擊按鈕。

#### Scenario: 高階 recipe card 顯示必要 cue
- **WHEN** 玩家開啟 `洞府百業` 並查看高階煉丹或煉器 recipe
- **THEN** 介面必須顯示 recipe tier、最低境界、材料擁有量、材料來源或 route tags
- **AND** 介面必須顯示產出品質、專精或 mastery cue

#### Scenario: 鎖定原因可被辨識
- **WHEN** 玩家尚未符合高階 recipe 的境界、百業等級或材料要求
- **THEN** 介面必須明確指出主要鎖定原因
- **AND** 不得只用 disabled button 隱藏失敗原因

#### Scenario: 不改動 actor token 表現
- **WHEN** 高階 Workshop UI 更新
- **THEN** 系統不得更改 `AdventureStage` 中玩家、NPC、怪物或角色 token 的文字呈現
- **AND** 像素化仍限定在 terrain / background production track
