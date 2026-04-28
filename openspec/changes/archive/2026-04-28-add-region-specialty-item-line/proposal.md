# Change: 建立地區特產物品線

## Why

不同地圖與境界需要有不同採集與掉落語彙，讓任務能要求玩家前往合理地區，而不是只依賴怪物擊殺。

## What Changes

- 定義地區特產 taxonomy。
- 每個主要地區至少提供一組可識別特產。
- 地區特產可被任務、丹方、器方或圖鑑來源追蹤引用。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `data/maps.ts`, `data/items/materials.ts`, future gathering systems
- Persistence: 第一階段只新增 catalog 與 source metadata，不需要 migration。
