# Change: 實裝核心屬性效果

## Why

`悟性 / 福緣 / 魅力` 已在角色 UI 中呈現，但玩法效果仍不夠集中與可讀。需要一個 derived helper 讓屬性實際影響修煉、掉落、遭遇與商店互動提示。

## What Changes

- 新增 `utils/attributeEffects.ts`，集中推導悟性、福緣與魅力效果。
- 將悟性 / 福緣接回戰鬥 stats 的突破、掉落與修煉加成顯示。
- 讓 StatsPanel 顯示這些屬性的實際效果。
- 供後續 NPC affinity / shop discount 讀取魅力折扣。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `utils/attributeEffects.ts`, `utils/battleStats.ts`, `components/StatsPanel.tsx`, tests
- Persistence: 不新增 persisted state；全部由既有 `character.attributes` 推導。
