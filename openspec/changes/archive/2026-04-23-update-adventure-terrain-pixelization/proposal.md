# 變更：正式 Adventure terrain/background 像素化整合

## 為什麼

`evaluate-pixel-art-vertical-slice` 已完成 prototype 驗證，但那條 change 的結論不是「把整個 entity layer 一起像素化」，而是確認像素 terrain 與 cue 在 web / mobile 可行。

目前正式 `AdventureStage` 仍只有黑底與格線。若要把像素風正式接回主畫面，最合理的第一步是只整合 terrain / background layer，保留玩家、NPC、怪物與戰鬥表現的既有語言。

## 這次要改什麼

- 為正式 `AdventureStage` 增加 theme-aware 的像素 terrain / background layer
- 保留玩家、NPC、怪物、portal、target marker 與 combat overlay 的現有表現
- 補 terrain generation helper、測試與文件，讓這條主線有明確驗證邊界

## 影響範圍

- Affected specs:
  - `client-interface`
- Affected code:
  - `components/adventure/AdventureStage.tsx`
  - `utils/adventureTerrainPixelization.ts`
  - `utils/adventureTerrainPixelization.test.ts`
  - `docs/04_UI/pixel_art_bible.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
