# Change: 擴充後期地圖本地內容密度 v3

## Why

`劫雲荒原 (160)`、`接引仙殿 (170)` 與仙帝前後地圖已具備怪物、Boss、宗門 world chapter 與像素地景，但 local NPC / rumor / material clue 仍集中在少數宗門章節 NPC。玩家抵達後期地圖時，除了戰鬥與主線提交點，缺少能說明地區狀態、路線材料來源與後續 Workshop sink 的本地資訊。

## What Changes

- 為 `160`、`170` 與至少一張仙帝終盤地圖補上 map-local hooks。
- 每張重點地圖至少提供：
  - route-agnostic local hook。
  - profession 或 sect sensitive hook。
  - Workshop material clue。
- 使用既有 `NPC`、`Quest`、`MapData.npcs`、dialogue-only quest 或 info NPC，不新增第二套地圖事件 runtime。
- 在圖鑑 / 地圖列表能看見新增 NPC 與 clue，不要求新增 persisted state 或 migration。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `data/npcs.ts`, `data/maps.ts`, `data/quests.ts`, map-local density tests, compendium / map modal smoke
- Persisted state: 不改 LocalStorage schema；只擴充靜態資料 catalog 與可由現有 quest/NPC UI 讀取的內容，因此不需要 migration。
