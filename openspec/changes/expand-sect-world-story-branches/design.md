## Context

三宗 `task_04` 已完成後段入口，但世界章節還沒有延伸成 map-local flow。這次沿用既有 `Quest / NPC / Encounter / Map` 結構，不重寫 quest engine。

## Goals

- 讓三宗後段故事能自然接到 `三界戰場 / 隕仙深淵 / 煉虛節點`
- 讓後段地圖有可發現的 NPC 或對話出口
- 用 regression 固定 quest、NPC、map 與 encounter 的對齊

## Non-Goals

- 不加入 branching quest engine
- 不重做 sect exclusivity
- 不把所有 120+ 地圖一次補滿為完整主線章節

## Decisions

- 第一批只補 `task_04` 後的共同世界章節與三宗差異 cue
- map-local NPC 以現有 NPC data 結構承接，不新增新 UI
- story milestone encounter 補故事與 reward cue，不取代 quest

## Risks / Trade-offs

- 若補太多任務，容易變成 quest engine overhaul。
  - Mitigation: 限制為後段章節入口與代表地圖 NPC。
- 若只補 NPC 對話，玩家成長節奏不會變厚。
  - Mitigation: 每段 story hook 必須對應 quest 或 encounter regression。

## Migration Plan

這條 change 只新增資料與測試，不新增 persisted state 欄位。

