# 變更：深化輪迴 build diversity v2

## 為什麼

輪迴正式流程已能完成生涯結算、Reincarnation Hall、perk、heirloom planner 與主動坐化。下一階段需要讓每一世的 build 方向更有差異，而不是只做數值加成。

## 這次要改什麼

- 補 build-oriented soul perk / seal / heirloom constraint
- 補 rebirth preview 的 build identity cue
- 讓 lifetime stats 或 world memory 能影響下一世規劃
- 補 soul persistence 與 planner migration regression

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
  - `client-persistence`
- Affected code:
  - `types.ts`
  - `data/reincarnationPerks.ts`
  - `store/slices/soulSlice.ts`
  - `store/actions/reincarnationActions.ts`
  - `pages/ReincarnationHall.tsx`
  - `store/persistedStateMigration.ts`
  - `docs/02_Gameplay/reincarnation.md`
