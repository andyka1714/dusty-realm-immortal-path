## 1. OpenSpec 與內容盤點

- [ ] 1.1 讀取 `docs/02_Gameplay/sect-world.md`、`docs/03_World/story.md`、`data/quests.ts`、`data/maps.ts`、`data/encounters.ts`
- [ ] 1.2 盤點三宗已完成的 `chapter_01 / chapter_02`、world memory tag、route material source cue
- [ ] 1.3 驗證 `openspec validate expand-sect-world-late-content-v3 --strict`

## 2. 三宗 v3 後段章節

- [ ] 2.1 先補 failing tests：三宗 v3 chapter 應有 map-local hook、route cue、完成結果
- [ ] 2.2 補凌霄劍宗 v3 後段章節，保留劍修 route identity 與可測結果
- [ ] 2.3 補萬獸山莊 v3 後段章節，保留體修 route identity 與可測結果
- [ ] 2.4 補縹緲仙宮 v3 後段章節，保留法修 route identity 與可測結果

## 3. Encounter / Workshop source 承接

- [ ] 3.1 補或更新 milestone encounter，確認 profession / sect gating、routeLabel、categoryLabel、choice cue
- [ ] 3.2 將 v3 chapter 結果接到既有 world memory tag 或 resolved event id，不新增 persisted schema
- [ ] 3.3 若提供 Workshop material source cue，只新增來源語意，不新增 recipe family

## 4. UI 可發現性與文件

- [ ] 4.1 確認 map-local NPC、QuestModal 或 pending encounter 能讓玩家看到下一步
- [ ] 4.2 補 Playwright smoke，確認 relevant modal / panel mobile 不 overflow
- [ ] 4.3 更新 `docs/02_Gameplay/sect-world.md`、`docs/03_World/story.md`、`docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- [ ] 4.4 明確記錄 schema change 為 `no`，不需要 migration

## 5. 驗證與收口

- [ ] 5.1 跑 `data/sectWorldStoryBranch.test.ts`、`data/sectLateProgression.test.ts`、`data/encounters.test.ts`
- [ ] 5.2 跑必要 Playwright smoke、`npm run typecheck`、`npm run build`、`git diff --check`
- [ ] 5.3 完成後更新 tasks 狀態、回寫 base specs、提交，再 archive
