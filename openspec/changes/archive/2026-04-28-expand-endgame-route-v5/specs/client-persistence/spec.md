## ADDED Requirements

### Requirement: 終盤路線 v5 不新增 persisted state
系統必須 (MUST) 讓 v5 route aftermath、Workshop follow-up、map-local clue、reincarnation seal 與 audit 只讀既有 catalog 與 world memory，不新增 LocalStorage schema。

#### Scenario: v5 使用既有記憶與 catalog
- **WHEN** v5 encounter selector、Workshop recipe、map-local quest 或 soul seal 判斷解鎖條件
- **THEN** 必須使用既有 `resolvedEventIds`、`soul.worldMemoryTags`、static item/recipe/NPC/quest catalog
- **AND** 不得新增 envelope 欄位、hydration migration、玩家圖鑑進度或 persisted source registry
