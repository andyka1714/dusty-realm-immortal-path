# Change: 建立煉丹材料物品線

## Why

低中境界煉丹材料目前不足，導致丹方與任務提交難以多元化。需要建立靈草、靈果、藥引、丹火媒介與毒材的境界階梯。

## What Changes

- 擴充煉丹材料 taxonomy。
- 為凡人到仙帝境界規劃代表丹材。
- 要求正式丹材至少有來源與消耗出口。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `types.ts`, `data/items/materials.ts`, `data/workshopRecipes.ts`, `data/drop_tables.ts`, new audit tests
- Persistence: 新增 catalog item 不需要 migration。
