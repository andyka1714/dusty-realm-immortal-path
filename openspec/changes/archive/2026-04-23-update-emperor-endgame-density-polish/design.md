## Context

目前後段高境界已完成第一輪主線 / 壓力支線補量與 representative regression，但審計文件仍明確指出：

1. `仙帝` 端比其他高境界更薄
2. 高境界普通怪的主題混融池已存在，但路線專屬材料 / 詞條感還不夠
3. 若後續再補內容或狀態，終盤門檻仍可能被意外放鬆

這代表現在需要的不是再改 battle core，而是收終盤內容的「量」與「辨識度」。

## Goals

- 讓 `仙帝` 端主線與壓力支線的內容密度不再明顯低於其他高境界
- 讓 `仙帝` 路線掉落與怪物組成有更清楚的專屬感
- 固定終盤 representative build regression，讓後續調整仍有可追蹤門檻

## Non-Goals

- 不重寫 battle core 公式
- 不擴張到新的大境界
- 不在這次變更中重做技能書系統

## Decisions

- 優先用現有 `maps / enemies / drops / regression tests` 路徑補強，不新增第二套後段內容框架
- `仙帝` 內容密度以主線地圖、壓力支線與精英 / Boss 配比調整為主，不用新 UI 承接
- 路線專屬感優先從普通怪 / 精英怪詞條與材料池強化，而不是只堆更高數值
- regression 以 `highRealmBalanceRegression.test.ts` 為主，補 `仙帝` representative build / 跨境界挑戰檢查

## Risks / Trade-offs

- 若只加怪物數量，不調路線主題與掉落，玩家只會覺得更拖
  - Mitigation: 每次補密度都同步補 route-specific 掉落或組成辨識
- 若只改 regression，不改內容本體，文件會再次落後
  - Mitigation: 這次把 maps / enemy pools / tests / docs 綁成同一條 change

## Migration Plan

1. 先盤點 `仙帝` 端 map / enemy / drop 缺口
2. 再補地圖內容密度與路線專屬池
3. 最後補 regression 與同步文件
