# Change: 新增 Reincarnation v6 魂印

## Why

v6 route、Workshop leaf 與歸墟 local clue 已建立下一世 build hook，但 Reincarnation 尚未提供正式 v6 魂印或 build reward。需要把 v6 clue 接回輪迴 loop，讓終盤 route reward 有跨世代出口。

## What Changes

- 為三宗 v6 route 新增對應魂印或 build reward。
- 魂印解鎖條件讀取既有 route memory、resolved encounter 或 Workshop / quest clue。
- Reincarnation UI 顯示 v6 魂印來源、鎖定原因與 build identity。

## Impact

- Affected specs: `game-mechanics`, `client-interface`
- Affected code: `data/reincarnationPerks.ts`, `utils/reincarnation.ts`, `components/game/ReincarnationFlow.tsx`, tests
- Persistence: 優先沿用既有 reincarnation / soul seal shape；若實作時需要新欄位，必須補 `client-persistence` delta 與 migration。
