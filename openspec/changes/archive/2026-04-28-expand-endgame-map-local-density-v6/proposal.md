# Change: 擴充終盤地圖 local density v6

## Why

`歸墟裂界 (182)` 已有 v5 local hook，但 180+ 終盤代表地圖仍可補更多 local NPC、route rumor、Boss clue 與 Workshop / Reincarnation 提示，讓地圖不只提供怪物池。

## What Changes

- 為 180+ 終盤地圖新增 v6 local NPC 與 dialogue-only quest。
- 每個新增 hook 至少說明 route rumor、Workshop 或 Reincarnation clue。
- 更新 map local density / content audit regression。

## Impact

- Affected specs: `client-interface`
- Affected code: `data/npcs.ts`, `data/quests.ts`, `data/mapLocalContentDensity.test.ts`, `data/contentAuthoringAudit.test.ts`
- Persistence: 不新增 persisted state；新增靜態 NPC / Quest catalog。
