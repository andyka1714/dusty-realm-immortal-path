# Change: 擴充突破災劫持續後果

## Why

突破 preview 已顯示成功率與災劫風險，但失敗結果仍沒有持續性心魔、傷勢或反噬狀態。高境界突破需要可恢復、可被 UI 讀取、可被 migration 保護的 consequence，才能成為真正玩法系統。

## What Changes

- 新增突破 consequence state，記錄心魔、傷勢或反噬等持續後果。
- Dashboard 顯示目前 consequence、持續時間、恢復方式與下次突破風險。
- 丹藥、Workshop recipe 或屬性效果可降低或清除 consequence。
- 新增 LocalStorage migration / hydration sanitize regression。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `types.ts`, `store/slices/characterSlice.ts`, `utils/breakthroughPreview.ts`, `pages/Dashboard.tsx`, persistence tests
- Persistence: 新增 persisted consequence state，必須補 migration、hydrate sanitize 與 regression。
