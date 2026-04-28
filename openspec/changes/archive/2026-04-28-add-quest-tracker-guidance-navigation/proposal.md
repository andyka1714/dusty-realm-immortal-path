# Change: 任務追蹤下一主線與導向

## Why

任務追蹤目前只顯示已接任務；當玩家沒有 active quest 時，只會顯示空狀態，無法知道下一個主線任務是什麼。任務追蹤也無法點擊導向 NPC、地圖或任務條件目的地，導致 HUD 有資訊但不能幫玩家行動。

## What Changes

- 任務追蹤在沒有 active quest 時，推導下一個可接主線任務並顯示為「下一主線」。
- 任務追蹤卡片可點擊，根據任務狀態導向回報 NPC、對話 NPC、擊殺目標地圖或任務起始 NPC。
- Adventure 以 runtime-only navigation event 接收導向，不新增 persisted state。
- 任務追蹤桌面位置重新貼近 compact HUD 下方，避免過度下移。

## Impact

- Affected specs: `client-interface`, `game-mechanics`
- Affected code: `utils/questTracker.ts`, `components/game/QuestTrackerHUD.tsx`, `pages/Adventure.tsx`, tests
- Persistence: 不新增 persisted schema；導向 intent 只存在當前 browser runtime，不寫入 LocalStorage。
