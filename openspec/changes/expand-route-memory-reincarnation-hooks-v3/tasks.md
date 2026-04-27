## 1. OpenSpec 與盤點

- [ ] 1.1 讀取 reincarnation perk / soul seal catalog、planner helper、soul reducer、Reincarnation UI 與 specs
- [ ] 1.2 確認本 change 不新增 persisted schema，記錄不需要 migration 的理由
- [ ] 1.3 跑 `openspec validate expand-route-memory-reincarnation-hooks-v3 --strict`

## 2. Planner catalog 與 reducer

- [ ] 2.1 先補 failing tests：三宗 `sect:*:world-chapter-03` 應解鎖對應 v3 soul seal 或 perk
- [ ] 2.2 補凌霄劍宗 v3 soul seal / perk，維持劍修 lane 與 heirloom constraint
- [ ] 2.3 補萬獸山莊 v3 soul seal / perk，維持體修 lane 與 heirloom constraint
- [ ] 2.4 補縹緲仙宮 v3 soul seal / perk，維持法修 lane 與 heirloom constraint
- [ ] 2.5 確認缺少 v3 memory 時 selected seal 會被 sanitize，不新增 persisted state

## 3. Reincarnation Hall UI

- [ ] 3.1 補 UI regression：available seal card 顯示 v3 route memory source、identity cue 與 expected benefit
- [ ] 3.2 補 UI regression：locked seal card 顯示缺少 `sect:*:world-chapter-03` 的原因
- [ ] 3.3 確認 preview 顯示 build identity、魂印與遺珍限制，不破壞 mobile-first hall layout

## 4. 文件與 specs

- [ ] 4.1 更新 reincarnation gameplay 文件或相關 tracking docs
- [ ] 4.2 更新 `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- [ ] 4.3 回寫 base specs，明確記錄 v3 route memory hooks 與 no migration

## 5. 驗證與收口

- [ ] 5.1 跑 targeted tests：`utils/reincarnation.test.ts`、`store/slices/soulSlice.test.ts`、`store/actions/reincarnationActions.test.ts`、`components/game/ReincarnationFlow.test.tsx`、`pages/Dashboard.reincarnation.test.tsx`
- [ ] 5.2 跑 `npm test`、必要 Playwright smoke、`npm run typecheck`、`npm run build`、`git diff --check`
- [ ] 5.3 完成後更新 tasks 狀態、提交 implementation、archive change，並提交 archive
