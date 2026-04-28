## 1. 規劃與測試基線

- [x] 1.1 建立 v5 execution plan 與 OpenSpec delta
- [x] 1.2 驗證 OpenSpec change
- [x] 1.3 先寫 failing tests：encounter、Workshop、map-local、reincarnation、content audit

## 2. Encounter v5

- [x] 2.1 新增三宗 repeatable v5 aftermath encounter
- [x] 2.2 確認 selector 讀取 `sect:*:endgame-loop-v4` 且不使用 `once_per_run`
- [x] 2.3 確認 choice cue 顯示 route、風險、收益與材料來源

## 3. Workshop v5

- [x] 3.1 新增三條職業向 endgame follow-up recipe
- [x] 3.2 確認 recipe consume `emperor_crown` 與對應 route material
- [x] 3.3 確認 sourceHint / routeTags 能被圖鑑與 audit 追蹤

## 4. Map Local v5

- [x] 4.1 新增 `歸墟裂界` v5 route rumor NPC 與 dialogue-only quest
- [x] 4.2 確認 map-local test 覆蓋 v5 NPC、quest、Workshop clue 與 route memory text

## 5. Reincarnation v5

- [x] 5.1 新增三條 v5 endgame soul seal
- [x] 5.2 確認 available / locked seal card 顯示 route memory、identity cue、預期收益與 heirloom hint

## 6. Audit / Docs / Validation

- [x] 6.1 擴充 content authoring audit coverage 到 v5 catalogs
- [ ] 6.2 更新 gameplay、world、reincarnation、tracking docs
- [ ] 6.3 跑 targeted tests、Playwright smoke、unit tests、typecheck、build、OpenSpec validate 與 `git diff --check`
- [ ] 6.4 完成後更新 tasks 狀態、提交並 archive
