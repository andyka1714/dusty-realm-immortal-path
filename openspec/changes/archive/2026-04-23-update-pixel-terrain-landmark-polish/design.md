## Context

Pixel terrain 已正式接入 `AdventureStage`，但這條線必須嚴守產品決策：只改地圖背景，不改玩家、怪物、NPC、HUD、portal marker 或 combat overlay 的 actor rendering。

## Goals

- 讓不同 theme / route 的地圖背景更有骨架差異
- 讓 landmark、arena、corridor、hazard 不只靠 palette 區分
- 建立桌機 / 手機代表畫面驗收點

## Non-Goals

- 不把玩家、怪物、NPC 改成 pixel sprite
- 不重做 live-combat overlay
- 不重寫整個 canvas renderer

## Decisions

- 繼續沿用 `adventureTerrainPixelization` helper 與 `AdventureStage` 繪製流程
- 若需要視覺回歸，先覆蓋代表地圖，不建立過重的全圖截圖矩陣
- actor-token guard 必須保留在 regression 中

## Risks / Trade-offs

- 視覺 polish 容易誤動 actor layer。
  - Mitigation: tasks 與 tests 明確固定 actor token 不變。
- 過多 screenshot regression 可能不穩。
  - Mitigation: 第一批只做代表地圖與必要 viewport。

## Migration Plan

這條 change 不涉及 persisted state。

