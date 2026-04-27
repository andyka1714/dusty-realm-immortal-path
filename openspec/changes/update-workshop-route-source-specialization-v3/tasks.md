## 1. OpenSpec 與盤點

- [x] 1.1 讀取現有 Workshop recipe、specialization tree、craft action、Workshop UI 與相關 specs
- [x] 1.2 確認本 change 不新增 persisted schema，記錄不需要 migration 的理由
- [x] 1.3 跑 `openspec validate update-workshop-route-source-specialization-v3 --strict`

## 2. Recipe 與 specialization data

- [x] 2.1 先補 failing tests：三宗 v3 route memory 應有對應 high-tier Workshop branch / source cue
- [x] 2.2 補凌霄劍宗 v3 recipe branch，消耗 `sword_path_starsteel` 並標示 `sect:sword:world-chapter-03`
- [x] 2.3 補萬獸山莊 v3 recipe branch，消耗 `beast_path_bloodbone` 並標示 `sect:beast:world-chapter-03`
- [x] 2.4 補縹緲仙宮 v3 recipe branch，消耗 `mystic_path_starlotus` 並標示 `sect:mystic:world-chapter-03`
- [x] 2.5 擴充 specialization leaf / effect cue，讓 v3 route source 對品質、熟練或副收益有可讀影響

## 3. Craft action 與 UI

- [x] 3.1 確認 craft action 不會因 specialization 跳過 route-specific material sink
- [x] 3.2 補 Workshop UI regression，顯示 v3 route source、recipe route tag、specialization cue 與鎖定原因
- [x] 3.3 確認本輪不採用 hard world memory gating；UI 顯示 v3 source cue 與材料缺口，避免新增 persisted unlock state

## 4. 文件與 tracking

- [x] 4.1 更新 `docs/02_Gameplay/workshop.md`
- [x] 4.2 更新 `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- [x] 4.3 回寫 base specs，明確記錄 v3 Workshop route source 與 no migration

## 5. 驗證與收口

- [x] 5.1 跑 targeted tests：`data/workshopRecipes.test.ts`、`store/actions/workshopActions.test.ts`、`pages/Workshop.crafting.test.tsx`
- [x] 5.2 跑 `npm test`、必要 Playwright smoke、`npm run typecheck`、`npm run build`、`git diff --check`
- [x] 5.3 完成後更新 tasks 狀態、提交 implementation、archive change，並提交 archive
