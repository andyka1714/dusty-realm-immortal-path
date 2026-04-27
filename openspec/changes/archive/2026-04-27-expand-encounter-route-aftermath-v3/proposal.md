# Change: Encounter route aftermath v3

## Why

三宗 v3 world chapter 已能在仙人境留下 once-per-run milestone encounter 與 `sect:*:world-chapter-03` world memory tag，但 milestone 完成後缺少可重複、可延伸的 route aftermath。這會讓 v3 章節再次變成一次性內容，而不是持續支撐仙人 / 仙帝階段的事件密度。

## What Changes

- 為凌霄劍宗、萬獸山莊、縹緲仙宮各新增 aftermath encounter，讀取對應 `sect:*:world-chapter-03` memory。
- 每條路線至少補穩定收益型與材料來源型 cue；若風險收益適合，補高風險高收益選項。
- Aftermath encounter 必須保留 `routeLabel`、`categoryLabel`、`chainLabel`、`memoryCue` 與 choice cue tags。
- Aftermath 必須不是 `once_per_run`，避免 v3 內容密度只靠一次性 milestone。
- 更新 pending encounter UI regression 與 tracking docs，記錄不新增 persisted schema、不需要 migration。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code:
  - `data/encounters.ts`
  - `data/encounters.test.ts`
  - `store/actions/encounterActions.test.ts`
  - `components/game/PendingEncounterPanel.test.tsx`
  - `docs/02_Gameplay/workshop.md`
  - `docs/02_Gameplay/sect-world.md`
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Release Gate

- Schema change? `no`
- Persisted surface: reads existing `soul.worldMemoryTags`, existing resolved event ids, existing quest completion state
- Migration / hydration sanitize: not needed because no new persisted field is introduced
- Regression coverage: encounter data, selector gating, choice resolution, pending panel cue rendering
