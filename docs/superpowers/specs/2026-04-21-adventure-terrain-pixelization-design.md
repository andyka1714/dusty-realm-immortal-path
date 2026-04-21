# Adventure Terrain Pixelization Design

## Context

`evaluate-pixel-art-vertical-slice` 已證明像素風地圖與場景 cue 在 web / mobile 可行，但那條 change 的重點是 prototype 驗證，不是直接改正式主畫面。

最新方向已明確收斂：

- 正式主畫面只改 terrain / background layer
- 玩家、NPC、怪物與戰鬥中的單字 avatar 維持現狀
- prototype test page 的 entity token 不作為主流程整合方向

這代表正式整合的第一步，不是回頭重畫角色，而是把目前 `AdventureStage` 的純黑底格線背景升級成 theme-aware 的像素 terrain。

## Goals

- 讓正式 `AdventureStage` 背景不再只是 `GRID_BG + grid line`
- 根據 `mapData.theme` 與地圖類型生成可讀的像素 terrain / background layer
- 保持玩家、NPC、怪物、target marker、combat overlay 與 portal 視覺完全不變

## Non-Goals

- 不把正式 `AdventureStage` 的 entity layer 改成 prototype token
- 不在這輪引入新的角色 sprite、怪物 sprite 或動畫庫
- 不重做 HUD 與 live-combat cue 視覺語言

## Decisions

- terrain layer 會放在正式 `AdventureStage` 的最底層，位於 grid overlay 與 entity layer 之下
- terrain 由 `mapData.theme` 驅動，先用程序化的 palette + patch 規則生成，不要求手工 tile 資料
- grid overlay 保留，但降低成輔助閱讀，不再承擔整個背景語言
- portal、NPC、玩家、怪物與戰鬥 overlay 的容器層級與現有樣式不改，只處理背景層

## Risks / Trade-offs

- 若 terrain 細節太滿，會搶掉 target / danger zone 的可讀性
  - Mitigation: terrain 顏色與 detail 對比控制在低到中等，只讓 combat overlay 保持最高優先級
- 若直接逐格畫滿所有 200x200 地圖，可能影響初始化成本
  - Mitigation: 用 theme-aware patch / tile 規則控制細節密度，先以單次靜態繪製為主
- 若不同主題 palette 太接近，正式整合的體感會不夠明顯
  - Mitigation: 先讓 `East / West / North / Sect / Immortal / Ultimate` 等主題至少有可辨識底色與點綴差異

## Success Criteria

- 正式 `AdventureStage` 背景能顯示像素化 terrain，而不是只有黑底格線
- 玩家、NPC、怪物外觀與互動方式維持現狀
- target marker、危險區、投射物與 status cue 在新背景上仍清楚可辨
- typecheck、build、測試與 OpenSpec 驗證維持通過
