## Context

正式 `AdventureStage` 目前已經有穩定的 entity layer、combat overlay、NPC marker 與 portal marker。真正單薄的是背景層：現在主要由 `GRID_BG + grid line` 構成。

prototype 已證明像素 terrain 在技術上可行，但使用者明確要求：

- 正式主畫面只改背景地圖
- 人物、角色、怪物、玩家表現全部維持現狀
- prototype test page 的文字 token 不推進到主流程

## Goals

- 讓正式 `AdventureStage` 背景有像素 terrain 體感
- 保持既有 entity、portal、NPC 與戰鬥視覺不變
- 讓 terrain 能依 `mapData.theme` 呈現最基本的主題差異

## Non-Goals

- 不引入角色 sprite / 怪物 sprite
- 不改寫 combat overlay 與 target HUD
- 不在這輪建立手工 per-map tile 編輯系統

## Decisions

- terrain 以新 helper 程序化生成，不要求為每張地圖建立手工 tile 資料
- `AdventureStage` 新增 terrain layer，放在 grid overlay 與其他 layer 底下
- grid 仍保留，但降低為輔助閱讀用
- entity layer、NPC layer、portal layer、combat overlay、effects layer 的建立順序與內容維持不變

## Risks / Trade-offs

- terrain 若太亮或太花，會搶掉 target / danger cue
  - Mitigation: 以低到中對比的 theme palette 為主，只留少量 patch detail
- terrain 若逐格細畫過多細節，會增加大圖初始化成本
  - Mitigation: helper 控制 patch 密度與 detail ratio，先以靜態單次繪製為主

## Migration Plan

1. 先定義 `mapData.theme -> terrain palette / patch rule`
2. 再把 terrain layer 插入正式 `AdventureStage`
3. 最後驗證 build、typecheck、測試與 OpenSpec
