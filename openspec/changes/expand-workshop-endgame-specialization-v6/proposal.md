# Change: 擴充 Workshop 終盤專精 v6

## Why

Workshop 已有 v5 follow-up recipe，但終盤專精仍偏提示與成本調整。需要新增職業向 endgame specialization leaf，讓帝冕 follow-up 的品質、副產物或熟練收益更清楚。

## What Changes

- 新增對應劍修、體修、法修的 endgame specialization leaf。
- Recipe card 顯示 active leaf 對 v5 / v6 recipe 的影響。
- 專精不跳過核心 route material，只影響成本、熟練、品質 cue 或副產物。

## Impact

- Affected specs: `game-mechanics`, `client-interface`
- Affected code: `data/workshopSpecializationTree.ts`, `data/workshopRecipes.ts`, `pages/Workshop.tsx`, tests
- Persistence: 沿用既有 specialization tree persisted shape，不新增欄位。
