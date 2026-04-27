## 1. OpenSpec 與盤點

- [ ] 1.1 讀取現有 Workshop recipe、specialization tree、craft action、Workshop UI 與相關 specs
- [ ] 1.2 確認本 change 不新增 persisted schema，記錄不需要 migration 的理由
- [ ] 1.3 跑 `openspec validate update-workshop-route-source-specialization-v3 --strict`

## 2. Recipe 與 specialization data

- [ ] 2.1 先補 failing tests：三宗 v3 route memory 應有對應 high-tier Workshop branch / source cue
- [ ] 2.2 補凌霄劍宗 v3 recipe branch，消耗 `sword_path_starsteel` 並標示 `sect:sword:world-chapter-03`
- [ ] 2.3 補萬獸山莊 v3 recipe branch，消耗 `beast_path_bloodbone` 並標示 `sect:beast:world-chapter-03`
- [ ] 2.4 補縹緲仙宮 v3 recipe branch，消耗 `mystic_path_starlotus` 並標示 `sect:mystic:world-chapter-03`
- [ ] 2.5 擴充 specialization leaf / effect cue，讓 v3 route source 對品質、熟練或副收益有可讀影響

## 3. Craft action 與 UI

- [ ] 3.1 確認 craft action 不會因 specialization 跳過 route-specific material sink
- [ ] 3.2 補 Workshop UI regression，顯示 v3 route source、recipe route tag、specialization cue 與鎖定原因
- [ ] 3.3 若採用 world memory gating，確認未達條件時 UI 顯示缺少哪條 `sect:*:world-chapter-03`

## 4. 文件與 tracking

- [ ] 4.1 更新 `docs/02_Gameplay/workshop.md`
- [ ] 4.2 更新 `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- [ ] 4.3 回寫 base specs，明確記錄 v3 Workshop route source 與 no migration

## 5. 驗證與收口

- [ ] 5.1 跑 targeted tests：`data/workshopRecipes.test.ts`、`store/actions/workshopActions.test.ts`、`pages/Workshop.crafting.test.tsx`
- [ ] 5.2 跑 `npm test`、必要 Playwright smoke、`npm run typecheck`、`npm run build`、`git diff --check`
- [ ] 5.3 完成後更新 tasks 狀態、提交 implementation、archive change，並提交 archive
