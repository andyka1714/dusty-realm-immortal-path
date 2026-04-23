## 1. Terrain production 規格
- [ ] 1.1 盤點既有 `adventureTerrainPixelization` helper 與 terrain tests，整理目前已有的 biome / route coverage
- [ ] 1.2 定義正式 biome palette、tile semantic role 與 named skeleton / landmark 規格
- [ ] 1.3 補 representative regression，確認主要 theme 不只換 palette，也有可追蹤背景骨架

## 2. 地圖可讀性 polish
- [ ] 2.1 強化 path、water、hazard、POI、portal clearing 與 Boss arena 的 terrain 語意
- [ ] 2.2 補 route-specific landmark coverage，特別是 `North / East / West / Spirit / Void / Immortal / Ultimate`
- [ ] 2.3 確認 pixel terrain polish 不改玩家、怪物、NPC、portal marker、combat overlay 與 HUD 的 entity rendering

## 3. 文件、review 與驗證
- [ ] 3.1 更新 `docs/04_UI/pixel_art_bible.md`，把 production terrain 規格與 actor-token 邊界寫回正式文件
- [ ] 3.2 更新 `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md` 與 `17_下一階段主線整合與優先級建議.md`
- [ ] 3.3 驗證 `npm test -- utils/adventureTerrainPixelization.test.ts`、`npm run typecheck`、`npm run build`
- [ ] 3.4 驗證 `openspec validate update-pixel-map-production-polish --strict`
