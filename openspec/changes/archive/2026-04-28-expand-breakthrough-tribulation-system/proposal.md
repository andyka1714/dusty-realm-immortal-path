# Change: 擴充突破與災劫系統

## Why

突破目前偏按鈕與機率結算，高境界缺少天劫、心魔、準備狀態與風險提示。需要把突破資訊拆成 preview 與結果提示，讓玩家能理解屬性、丹藥與境界風險。

## What Changes

- 新增突破 preview helper，推導成功率、風險、建議準備與高境界災劫文案。
- Dashboard 突破區顯示 preview，不只顯示可否突破。
- 突破失敗 log 顯示災劫 / 心魔風險語意，但第一版不新增持續性傷勢 state。

## Impact

- Affected specs: `game-mechanics`, `client-interface`
- Affected code: `utils/breakthroughPreview.ts`, `pages/Dashboard.tsx`, tests
- Persistence: 不新增 persisted state；失敗結果沿用既有修為扣減與 log。
