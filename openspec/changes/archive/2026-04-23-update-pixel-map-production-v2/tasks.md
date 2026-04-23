## 1. Terrain production vocabulary
- [x] 1.1 盤點現有 biome palette、semantic role、skeletonId 與 landmark motif
- [x] 1.2 補 `North / East / West / Spirit / Void / Immortal / Ultimate` 代表 route 的 macro-shape / landmark 規格
- [x] 1.3 補 special terrain、resource node、Boss arena 與 portal threshold 規格
- [x] 1.4 更新 deterministic helper，保持輸出可測且不依賴隨機素材

## 2. 正式場景整合與 guard
- [x] 2.1 更新 `AdventureStage` terrain/background layer
- [x] 2.2 補 terrain-only 欄位白名單，禁止 `actorToken / tokenLabel / spriteId / monsterName / npcSymbol / portalMarker / hudCue / combatOverlay`
- [x] 2.3 補 actor-token guard，確認玩家、NPC、怪物、角色 token 不被改成 sprite
- [x] 2.4 檢查 combat overlay、target marker、HUD 在新背景上的可讀性

## 3. 測試、文件與驗證
- [x] 3.1 補 terrain table-driven regression，覆蓋代表 route family
- [x] 3.2 補 mobile / desktop scale 或 preview budget smoke regression
- [x] 3.3 更新 `pixel_art_bible` 與 v2 tracking docs
- [x] 3.4 驗證 `openspec validate update-pixel-map-production-v2 --strict`、targeted tests、`npm run typecheck`、必要時 `npm run build`
