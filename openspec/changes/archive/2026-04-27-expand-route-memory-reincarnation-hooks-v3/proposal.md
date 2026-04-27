# Change: Route memory reincarnation hooks v3

## Why

三宗 v3 route memory 已能由 world chapter / aftermath encounter 寫入 `soul.worldMemoryTags`，但 Reincarnation Hall 目前主要讀早期 route memory，如 `route:sword:soul-sheath` 與 `sect:*:world-chapter-02`。若 v3 記憶無法影響下一世 build，宗門世界後段成果仍只停留在當世事件與 Workshop。

## What Changes

- 新增三宗 v3 route memory 對應的高階 soul seal 或 route perk。
- Reincarnation planner 讀取既有 `sect:*:world-chapter-03`，解鎖更高階的劍修、體修、法修轉世 cue。
- Reincarnation Hall 顯示 v3 route memory 對 build identity / soul seal / expected benefit 的影響。
- Heirloom compatibility 維持既有 lane 限制，不讓錯職業主武器或手札繞過。
- 更新 docs/specs，明確記錄本輪不新增 persisted schema、不需要 migration。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code:
  - `data/reincarnationPerks.ts`
  - `utils/reincarnation.ts`
  - `utils/reincarnation.test.ts`
  - `store/slices/soulSlice.test.ts`
  - `store/actions/reincarnationActions.test.ts`
  - `components/game/ReincarnationFlow.tsx`
  - `components/game/ReincarnationFlow.test.tsx`
  - `pages/Dashboard.reincarnation.test.tsx`
  - `docs/02_Gameplay/reincarnation.md` 或相關 gameplay docs
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Release Gate

- Schema change? `no`
- Persisted surface: reads existing `soul.worldMemoryTags` and existing `rebirthConfig`
- Migration / hydration sanitize: not needed because no new persisted field is introduced
- Regression coverage: planner availability, soul reducer selection / sanitization, Reincarnation UI rendering, rebirth action carry-over
