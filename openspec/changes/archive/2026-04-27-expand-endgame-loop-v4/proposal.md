# Change: 擴充終盤循環 v4

## Why

`仙帝` 端目前已有 route-specific encounter、v3 aftermath、Workshop route source、輪迴 route memory hook 與內容 audit，但這些系統仍偏向各自存在。下一步需要把終盤事件、百業材料 sink、輪迴記憶回饋與主動收束語意串成同一條可追蹤循環，避免玩家在終盤只看到重複刷材料或不清楚何時該飛升、結局或主動重開。

## What Changes

- 補 `仙帝` 端 v4 route aftermath chain，讓三宗終盤事件能產生可被後續系統讀取的 route endgame memory。
- 補高階 Workshop 終盤 sink，讓三種 route-specific material 有可追蹤的 convergence recipe 或等效終盤消耗。
- 補輪迴 route memory reward，讓完成 v4 終盤記憶後可在輪迴大殿看見更明確的下一世 build 回饋。
- 補主動收束 / 飛升 / 結局 / 重開的 UI 語意 cue，讓玩家能分辨「死亡輪迴」與「主動完成本世」。
- 更新 gameplay / balance tracking / validation 文件，明確記錄不需要 migration。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: encounter catalog/tests、Workshop recipe/tests、reincarnation perk/UI/tests、Dashboard/Reincarnation UI copy、content audit/source tracing regression
- Persisted state: 不新增 LocalStorage schema、hydrate envelope 或新 persisted catalog 欄位；v4 只使用既有 `resolvedEventIds`、`soul.worldMemoryTags`、inventory、Workshop recipe catalog 與既有 rebirth config，因此不需要 migration。
