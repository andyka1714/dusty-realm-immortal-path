# Change: 建立任務物品線

## Why

任務物品需要和一般材料分離，避免信物、殘圖、玉簡等劇情道具被 Workshop 或商店誤用。

## What Changes

- 定義任務物品 taxonomy：信物、令牌、薦書、樣本、殘圖、玉簡、NPC 私物。
- 任務物品不得進入一般 recipe，除非規格明確允許。
- 支援後續提交物品、劇情分支與地圖探索任務。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `types.ts`, `data/items/*`, `data/quests.ts`, quest authoring audits
- Persistence: 若只新增 catalog item，不需要 migration；若新增任務物品保護欄位，需另行評估。
