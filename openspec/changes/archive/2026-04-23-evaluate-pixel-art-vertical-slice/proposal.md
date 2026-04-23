# 變更：建立像素風 pre-production 與 Adventure vertical slice 基線

## 為什麼

目前專案的玩法主體已經站在 `PixiJS + 格子地圖 + sprite/overlay` 這條 2D 路徑上，技術上比真 3D 更適合直接轉向正式 `pixel-art` 視覺語言。

但現在仍缺少三件關鍵基線：

1. 沒有正式的像素風 art bible，tile / sprite / UI / VFX 都沒有統一規格
2. 沒有一個可跑的 representative vertical slice，可以驗證 web / mobile 的可讀性與效能
3. 沒有把「自主生成像素素材」的上限、下限與 review gate 寫成正式規格

如果直接跳 full rollout，後續很容易在玩法還持續變動時大量返工資產與 UI 語言。

## 這次要改什麼

- 建立正式的 `pixel-art art bible`，定義 tile、sprite、UI、VFX、調色與 runtime scale 規格
- 鎖定一個代表性 `Adventure` vertical slice 範圍，作為像素風 prototype 的正式入口
- 定義 web / mobile 驗證門檻與效能 budget
- 定義自主生成像素素材在 prototype 階段的可接受邊界與 review 規則
- 同步把這條主線登記進 tracking docs，明確標示為 `pre-production`，而不是直接 full rollout

## 影響範圍

- Affected specs:
  - `client-interface`
  - `game-mechanics`
- Affected code:
  - `components/adventure/AdventureStage.tsx`
  - `pages/Adventure.tsx`
  - `docs/04_UI/pixel_art_bible.md`
  - `docs/06_Balance_Audit/13_3D渲染與戰鬥呈現評估.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
  - `docs/06_Balance_Audit/17_下一階段主線整合與優先級建議.md`
