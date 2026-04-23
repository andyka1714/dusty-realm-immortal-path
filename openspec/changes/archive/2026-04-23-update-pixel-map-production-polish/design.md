## Context

目前像素風已經完成兩個前置階段：

1. `evaluate-pixel-art-vertical-slice`：驗證 `東郊靈田` prototype、web / mobile scale 與 performance budget。
2. `update-adventure-terrain-pixelization`：把正式 `AdventureStage` 的 terrain / background layer 接回主畫面。

這兩條 change 的共同結論是 hybrid direction：

- 地圖 terrain / background 可以像素化
- 玩家、怪物、NPC 與角色本體維持文字 token
- 戰鬥 cue、target marker、portal marker 與 HUD 暫時沿用正式版語言

目前正式地圖已經有大量 map-specific terrain tests，但 production 規格仍偏分散。若後續繼續擴地圖，缺少一份穩定的 biome / tile / landmark 語言，會讓新地圖只剩 palette 差異。

## Goals

- 讓 Adventure terrain 有可重複擴量的 biome palette 與 tile semantic
- 讓 route-specific 地圖具備背景骨架差異，而不是只換顏色
- 讓 path、water、hazard、POI、portal clearing 與 Boss arena 都有 regression 保護
- 明確保護 actor token 層，不讓 pixel polish 誤改玩家 / 怪物 / NPC 呈現

## Non-Goals

- 不產生玩家、怪物、NPC pixel sprite
- 不做八方向動畫、角色 sprite sheet 或大型 asset pipeline
- 不改 battle core、AI、掉落、地圖連通或 persisted state migration
- 不把 prototype entity token 實驗推進主流程

## Decisions

- terrain production polish 優先落在 `utils/adventureTerrainPixelization.ts` 的 deterministic helper 與 tests，不先改大型 renderer 架構
- `AdventureStage` 只允許消費 terrain metadata；若需要調整，也不能動 entity token rendering path
- production 規格以 semantic role 命名，例如 `ground`、`path`、`water`、`hazard`、`poi`、`portalClearing`、`bossArena`
- representative coverage 必須同時包含早期三路線、安全城鎮、中高境界 theme 與 `Ultimate / Immortal / Void / Spirit / North / East / West` 的 route-specific skeleton

## Risks / Trade-offs

- 風險：過度追求每張地圖獨特性會讓 helper 變成不可維護的大型 hardcode。
  - Mitigation: 把差異收斂為 named skeleton / semantic roles，測試檢查語意而不是每一格 snapshot。
- 風險：開發時誤把 actor token 當成像素風延伸範圍。
  - Mitigation: OpenSpec、docs 與 tests 都明確要求 entity layer 不變。
- 風險：背景細節過多會壓過戰鬥 cue。
  - Mitigation: terrain palette 保持低對比底色，hazard / telegraph / HUD 仍保留最高可讀性。

## Migration Plan

1. 先補 production terrain role / palette / skeleton 規格與 regression。
2. 再逐步重整現有 map-specific terrain 規則，確保 route-specific 背景骨架可讀。
3. 最後更新 pixel art bible、tracking docs 與 OpenSpec tasks。

## Open Questions

- 是否需要在後續第二條 change 補真正的 external tileset asset export，目前先不做。
- 是否要為每張地圖新增 debug overlay，目前先以 tests 和 helper metadata 作為主要驗證。
