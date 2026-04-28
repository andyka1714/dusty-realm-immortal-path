# Change: 收緊功法取得到裝備流程

## Why

功法面板、藏經閣商店與背包參悟已分別存在，但玩家仍需要更清楚理解「取得秘卷 → 背包參悟 → 已學功法 → 裝備參戰」這條 RPG loop。

## What Changes

- 功法面板新增取得流程提示，連接藏經閣、任務、掉落、背包參悟與戰鬥裝備。
- 背包參悟成功時的 log 提醒玩家可到功法面板裝備主動術式。
- 功法秘卷 UI 顯示「買了不等於已學，需背包參悟」與「已學後至功法面板裝備」。

## Impact

- Affected specs: `client-interface`, `game-mechanics`
- Affected code: `components/game/SkillPanel.tsx`, `pages/Inventory.tsx`, tests
- Persistence: 不新增 persisted state；沿用現有 `character.skills` 與 `equippedActiveSkillId`。
