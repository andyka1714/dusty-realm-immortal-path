## 1. Terrain 骨架與繪製
- [ ] 1.1 盤點 `semanticRole / skeletonId` 目前有資料但未充分反映到繪製的缺口
- [ ] 1.2 強化 landmark、corridor、arena、portal clearing 與 hazard 的 terrain rendering
- [ ] 1.3 確認玩家、怪物、NPC、HUD、portal marker 與 combat overlay 完全維持現狀

## 2. 覆蓋與視覺回歸
- [ ] 2.1 把代表地圖 theme / route coverage 擴成 table-driven terrain regression
- [ ] 2.2 視需要補正式 `AdventureStage` 桌機 / 手機視覺回歸
- [ ] 2.3 確認 mobile / desktop pixel scale 與效能 budget 沒有退化

## 3. 文件與驗證
- [ ] 3.1 更新 `docs/04_UI/pixel_art_bible.md`
- [ ] 3.2 驗證 `openspec validate update-pixel-terrain-landmark-polish --strict`、pixel terrain tests、`npm run typecheck`、必要時 `npm run build`

