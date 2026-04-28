# Change: 擴充終盤路線 v5 閉環

## Why

v4 已把三宗終盤記憶收束到 `sect:*:endgame-loop-v4`，但目前後續仍停在單一 convergence event、單一 `歸墟三道帝冕` sink 與 v4 soul seal。下一步需要把這些記憶延伸成可重複 encounter、職業向 Workshop follow-up、地圖本地線索、輪迴 build 預覽與 authoring audit 防線。

## What Changes

- 新增三宗 v5 repeatable endgame aftermath encounter，讀取 `sect:*:endgame-loop-v4`，補穩定收益 / 高風險收益 / 材料來源 cue。
- 新增三條 v5 職業向 Workshop follow-up recipe，承接 `歸墟三道帝冕` 與三宗終盤 route material。
- 補 `歸墟裂界` 終盤後續 NPC 與 dialogue-only quest，提供 v5 route rumor 與 Workshop clue。
- 新增 v5 輪迴魂印，讓 v4 endgame memory 影響下一世 build preview 與 heirloom hint。
- 擴充 content authoring audit，檢查 v5 encounter / recipe / NPC / reincarnation seal 的 route tag 與 reference coverage。
- 更新 gameplay / world / reincarnation / tracking docs。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `data/encounters.ts`, `data/workshopRecipes.ts`, `data/npcs.ts`, `data/quests.ts`, `data/maps.ts`, `data/reincarnationPerks.ts`, `data/contentAuthoringAudit.ts`, tests
- Schema change? No
- Migration required? No。v5 只新增 static catalog entries 與 derived audit/test coverage，讀取既有 `resolvedEventIds`、`soul.worldMemoryTags`、Workshop recipe catalog、map NPC / quest catalog，不新增 LocalStorage envelope 欄位、hydrate shape 或 persisted source registry。
