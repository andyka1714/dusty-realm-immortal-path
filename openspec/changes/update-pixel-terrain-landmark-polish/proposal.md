# 變更：強化像素地圖 landmark 與 terrain 骨架

## 為什麼

正式 `AdventureStage` 已完成 terrain/background 像素化，且玩家、怪物、NPC 維持文字 token 是已確認產品邊界。不過目前 terrain metadata 已有 `semanticRole / skeletonId`，實際繪製仍偏通用方塊與重複 detail pattern，還缺更清楚的 landmark、corridor、arena 與 route-specific 地景骨架。

## 這次要改什麼

- 讓 terrain helper 的 semantic role 與 skeleton motif 更明確反映到正式繪製
- 強化 landmark、Boss arena、path corridor、portal clearing 與 hazard 的地圖可讀性
- 補代表地圖 table-driven regression，鎖住不同 theme 不回退成同一 floorplan
- 視需要補桌機 / 手機視覺回歸
- 同步 `pixel_art_bible`，再次固定 actor token 不像素化的邊界

## 影響範圍

- Affected specs:
  - `client-interface`
- Affected code:
  - `components/adventure/AdventureStage.tsx`
  - `utils/adventureTerrainPixelization.ts`
  - `utils/adventureTerrainPixelization.test.ts`
  - `tests/visual/adventureStageTerrain.spec.ts`
  - `docs/04_UI/pixel_art_bible.md`

