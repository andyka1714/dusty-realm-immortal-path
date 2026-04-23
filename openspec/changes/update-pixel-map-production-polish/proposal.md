# 變更：像素地圖 production polish

## Why

`evaluate-pixel-art-vertical-slice` 已驗證 web / mobile 的像素風 vertical slice，`update-adventure-terrain-pixelization` 也已把正式 `AdventureStage` 的 terrain / background layer 接回主流程。

目前剩下的不是「是否能做像素風」，也不是「是否要把角色改成 pixel sprite」。玩家已明確確認下一步只要地圖像素化，玩家、怪物、NPC 與角色 token 都必須維持現有文字遊戲感。

因此這條 change 要把已存在的 pixel terrain 從「能顯示」推進成可重複擴量的 production 地圖語言：biome palette、tile semantic、landmark / POI / path / hazard 規格與 mobile / desktop budget。

## What Changes

- 整理正式 Adventure 地圖的 biome palette、tile semantic 與 terrain role 規格
- 強化 path、water、hazard、POI、portal clearing、Boss arena 與 route-specific landmark 的地圖可讀性
- 補 representative regression，確保不同 theme / route 不只換 palette，而是有可追蹤的背景骨架
- 更新 pixel art bible 與下一階段文件，固定「只改地圖背景，不改 actor token」的產品決策

## Non-Goals

- 不把玩家、怪物、NPC 或角色本體改成 pixel sprite
- 不重寫 `AdventureStage` 的 entity layer、combat overlay、target marker 或 HUD
- 不引入 3D、Pixi renderer 重寫或新的 asset pipeline
- 不改 battle core、怪物 AI 或 persisted state schema

## Impact

- Affected specs:
  - `client-interface`
- Affected code:
  - `utils/adventureTerrainPixelization.ts`
  - `utils/adventureTerrainPixelization.test.ts`
  - `components/adventure/AdventureStage.tsx`（只在 terrain layer metadata 需要時觸碰，不改 entity rendering）
  - `docs/04_UI/pixel_art_bible.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
