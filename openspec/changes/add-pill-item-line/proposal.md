# Change: 建立丹藥物品線

## Why

丹藥目前已有修為、恢復、突破與壽元項目，但分類語義不足。需要正式分出修為丹、恢復丹、戰鬥丹、突破丹與特殊丹，並按境界支撐任務與 Workshop。

## What Changes

- 定義丹藥用途 taxonomy。
- 為不同境界補合理丹藥階梯。
- 要求丹藥有境界需求、效果、來源與 recipe 或商店承接。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `types.ts`, `data/items/consumables.ts`, `data/workshopRecipes.ts`, `pages/Inventory.tsx`, tests
- Persistence: 新增 catalog item 不需要 migration。
