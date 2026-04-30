# Change: 補齊各境界丹藥梯度

## Why

目前丹藥與戰鬥服用機制已能運作，但常規丹藥主要集中在凡人到金丹。高境界缺少對應的修為丹、回血丹與回魔丹，會讓任務獎勵、怪物掉落、工坊煉丹與圖鑑顯示在中後期斷層。

## What Changes

- 每個大境界至少新增或指定一個修為丹、回血丹與回魔丹。
- 所有回血、回魔與混合恢復丹維持 5 秒共用恢復冷卻。
- 本階段不發布完全恢復丹，避免補給強度失控。
- 丹藥圖鑑依境界顯示完整效果文字。
- 工坊丹方補上新丹藥來源；低中境界可在合適商店取得部分常規補給。
- 不新增丹藥品階倍率或煉製品質機率。

## Impact

- Affected specs: `game-mechanics`
- Affected code: `data/items/consumables.ts`, `data/items/itemLineMetadata.ts`, `data/workshopRecipes.ts`, `data/shops.ts`, item metadata tests
- Persistence: 不新增 persisted state。
