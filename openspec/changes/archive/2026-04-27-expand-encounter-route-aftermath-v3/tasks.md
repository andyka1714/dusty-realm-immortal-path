## 1. OpenSpec 與盤點

- [x] 1.1 讀取 v3 milestone encounter、selector gating、pending panel cue tests 與相關 specs
- [x] 1.2 確認本 change 不新增 persisted schema，記錄不需要 migration 的理由
- [x] 1.3 跑 `openspec validate expand-encounter-route-aftermath-v3 --strict`

## 2. Aftermath encounter data

- [x] 2.1 先補 failing tests：三宗 v3 world memory 應解鎖 repeatable aftermath encounter
- [x] 2.2 補凌霄劍宗 aftermath，讀 `sect:sword:world-chapter-03`，提供穩定收益與 `sword_path_starsteel` source cue
- [x] 2.3 補萬獸山莊 aftermath，讀 `sect:beast:world-chapter-03`，提供風險收益與 `beast_path_bloodbone` source cue
- [x] 2.4 補縹緲仙宮 aftermath，讀 `sect:mystic:world-chapter-03`，提供神識收益與 `mystic_path_starlotus` source cue
- [x] 2.5 確認 aftermath 不是 `once_per_run`，且缺少 world memory 時不會出現在 selector

## 3. Resolution 與 UI

- [x] 3.1 補 encounter action regression，確認 aftermath choice 結算仍寫入 reward / resolved event 並不新增 state
- [x] 3.2 補 pending panel regression，顯示 aftermath routeLabel、categoryLabel、chainLabel、memoryCue 與 choice cue
- [x] 3.3 跑 Playwright pending encounter smoke，確認 mobile modal 不 overflow

## 4. 文件與 specs

- [x] 4.1 更新 `docs/02_Gameplay/sect-world.md`
- [x] 4.2 更新 `docs/02_Gameplay/workshop.md`
- [x] 4.3 更新 `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`
- [x] 4.4 回寫 base specs，明確記錄 aftermath v3 與 no migration

## 5. 驗證與收口

- [x] 5.1 跑 targeted tests：`data/encounters.test.ts`、`store/actions/encounterActions.test.ts`、`components/game/PendingEncounterPanel.test.tsx`
- [x] 5.2 跑 `npm test`、必要 Playwright smoke、`npm run typecheck`、`npm run build`、`git diff --check`
- [x] 5.3 完成後更新 tasks 狀態、提交 implementation、archive change，並提交 archive
