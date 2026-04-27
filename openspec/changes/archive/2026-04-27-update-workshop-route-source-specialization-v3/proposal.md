# Change: Workshop route source specialization v3

## Why

三宗 v3 後段章節已能產出 `sect:*:world-chapter-03` world memory tag 與對應 route material cue，但 Workshop 目前仍主要以既有 recipe / mastery / specialization tree 承接材料，尚未把這批 v3 章節記憶正式轉成更深的 recipe branch、source hint 與 specialization unlock cue。

這條 change 讓剛完成的宗門世界後段內容反向供料給 Workshop，使高階百業不只消耗 route material，也能讀懂玩家完成哪條宗門世界章節。

## What Changes

- 新增或擴充高階 Workshop recipe branch，讓凌霄劍宗、萬獸山莊、縹緲仙宮 v3 材料各有更明確的高階用途。
- 讓 recipe metadata 顯示對應 `sect:*:world-chapter-03` source cue、route tag 與 high-realm material sink。
- 擴充 Workshop specialization tree 或 specialization effect cue，讓 leaf / unlock reason 能讀出 v3 route memory 的價值。
- 更新 Workshop UI regression，確認 recipe card / specialization panel 能顯示 v3 route source 與專精影響。
- 更新 gameplay / workshop / priority tracking 文件，記錄本輪不新增 persisted schema、不需要 migration。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code:
  - `data/workshopRecipes.ts`
  - `data/workshopRecipes.test.ts`
  - `data/workshopSpecializationTree.ts`
  - `store/actions/workshopActions.ts`
  - `store/actions/workshopActions.test.ts`
  - `pages/Workshop.tsx`
  - `pages/Workshop.crafting.test.tsx`
  - `docs/02_Gameplay/workshop.md`
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Release Gate

- Schema change? `no`
- Persisted surface: reads existing `soul.worldMemoryTags`, existing Workshop mastery / specialization state, existing inventory items
- Migration / hydration sanitize: not needed because no new persisted field is introduced
- Regression coverage: recipe data, craft action, Workshop UI, existing persistence validation through unchanged state shape
