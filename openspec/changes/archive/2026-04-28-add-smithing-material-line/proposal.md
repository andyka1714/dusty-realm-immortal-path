# Change: 建立煉器材料物品線

## Why

煉器目前有基礎玄鐵與高階 route material，但缺少中間境界的礦石、精金、妖獸部件與器魂材料，無法支撐多元裝備任務與煉器 recipe。

## What Changes

- 建立礦石、精金、妖獸部件、器魂材料、天外材料 taxonomy。
- 為不同境界與職業裝備提供可引用材料。
- 要求煉器材料具備來源與 sink。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `types.ts`, `data/items/materials.ts`, `data/workshopRecipes.ts`, `data/drop_tables.ts`, equipment audits
- Persistence: 新增 catalog item 不需要 migration。
