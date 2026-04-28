# Change: 任務追蹤狀態與目標類型整理

## Why

任務追蹤目前只顯示單一 `追蹤中 / 可回報 / 下一主線` 文案，無法清楚區分可接取、進行中、待完成，也無法為未來的對話、討伐、提交物品、境界或複合任務提供一致呈現。

## What Changes

- 新增 derived quest tracker view model，統一推導任務 lifecycle、目標類型、進度列與主要導向。
- 任務追蹤卡片區分 `可接取`、`進行中`、`可回報`、`下一主線` 等狀態。
- 任務目標支援對話、討伐、提交物品、境界與複合任務的進度列。
- 保持任務導向為 runtime-only intent，不新增 persisted schema。

## Impact

- Affected specs: `client-interface`, `game-mechanics`
- Affected code: `utils/questTracker.ts`, `components/game/QuestTrackerHUD.tsx`, related tests and e2e
- Persistence: 不新增 LocalStorage 欄位；從既有 quest、active quest、completed quest、inventory、character state 推導 UI。
