# 變更：像素地圖 production v2

## 為什麼

正式 `AdventureStage` 已完成 terrain/background 像素化與 landmark polish。下一階段應繼續強化地圖 production 規格，但不得把玩家、NPC、怪物或角色 token 改成 sprite。

## 這次要改什麼

- 擴充 biome palette、tile grammar 與 landmark catalog
- 補 special terrain、Boss arena、portal threshold、hazard / resource nodes
- 補 actor-token guard 與 mobile readability regression
- 更新 pixel art bible

## 影響範圍

- Affected specs:
  - `client-interface`
- Affected code:
  - `components/adventure/AdventureStage.tsx`
  - `utils/adventureTerrainPixelization.ts`
  - `docs/04_UI/pixel_art_bible.md`
  - `utils/adventureTerrainPixelization.test.ts`
