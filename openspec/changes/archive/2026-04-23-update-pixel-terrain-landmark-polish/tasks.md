## 1. Terrain 骨架與繪製
- [x] 1.1 盤點 `semanticRole / skeletonId` 目前有資料但未充分反映到繪製的缺口
- [x] 1.2 強化 landmark、corridor、arena、portal clearing 與 hazard 的 terrain rendering
- [x] 1.3 確認玩家、怪物、NPC、HUD、portal marker 與 combat overlay 完全維持現狀

## 2. 覆蓋與視覺回歸
- [x] 2.1 把代表地圖 theme / route coverage 擴成 table-driven terrain regression
- [x] 2.2 視需要補正式 `AdventureStage` 桌機 / 手機視覺回歸
- [x] 2.3 確認 mobile / desktop pixel scale 與效能 budget 沒有退化

## 3. 文件與驗證
- [x] 3.1 更新 `docs/04_UI/pixel_art_bible.md`
- [x] 3.2 驗證 `openspec validate update-pixel-terrain-landmark-polish --strict`、pixel terrain tests、`npm run typecheck`、必要時 `npm run build`

備註：目前 repo 沒有既有 `tests/visual` 或 Playwright screenshot regression 結構可直接延伸；Phase 4 以 helper/rendering motif regression 強化，避免為單一 terrain polish 建立過重且不穩定的截圖矩陣。
