# Design: 宗門與世界後段內容 v3

## Context

目前宗門世界線已完成 `task_04` 後的 v1 / v2 route chapters，並能透過 Quest、NPC、Encounter 與 world memory tag 串接後續系統。Encounter v3 已補終盤 route-specific event 與高境界 cue。v3 的重點是把宗門 / 世界線推進到更後段，讓玩家在中後期不只靠 encounter 隨機內容，而是能看見宗門身份延伸出的世界承接。

## Goals

- 每宗補一段 v3 late route chapter 或等效 milestone chain。
- 至少補一批 map-local NPC / quest hook / encounter hook，讓內容可發現。
- 讓完成結果能被 encounter selector、Workshop source 或 world memory 後續讀取。
- 不新增第二套 quest engine，不新增 persisted schema。

## Non-Goals

- 不重做宗門加入流程。
- 不新增大型主線劇情系統、對話樹引擎或 cutscene runtime。
- 不更動已完成的 encounter v3 event id。
- 不把 Workshop recipe expansion 塞進本 change；只提供 source cue 或材料承接點。

## Content Shape

### Route Chapters

- 凌霄劍宗：偏劍道盟約、帝劍殘痕、戰場裁決。
- 萬獸山莊：偏帝血獸脈、荒獸巢穴、肉身試煉。
- 縹緲仙宮：偏星詔、法陣、仙宮觀測與星魂材料。

每宗 v3 內容至少包含：

- 一個 map-local NPC 或既有 NPC 新增 quest hook。
- 一個 quest / milestone event / encounter hook。
- 一個可讀 route cue。
- 一個完成後可被測試讀取的結果，例如 completed quest id、resolved event id 或 world memory tag。

### Integration

- Encounter v3：若玩家已完成本宗 v3 chapter，可提高或解鎖對應 route-specific 終盤 encounter 的語意承接。
- Workshop：v3 chapter 可以提供 route material source cue，但不新增 recipe family。
- Compendium：若圖鑑 UI change 已完成，宗門章節線索可在 `宗門傳承` tab 裡呈現；若尚未完成，本 change 仍只保證 NPC / Quest / Encounter 可發現性。

## Testing

- `data/sectWorldStoryBranch.test.ts`：三宗 v3 chapter 的 quest / NPC / map hook 對齊。
- `data/encounters.test.ts`：v3 milestone encounter 的 profession / sect gating、once-per-run 或 repeat policy、route cue。
- `data/sectLateProgression.test.ts`：既有中後期 progression 不被 v3 內容破壞。
- Playwright smoke：進入 relevant panel / map 後，quest modal 或 pending encounter 不 overflow、不黑畫面。

## Release Notes

- Base spec update: 完成後更新 `game-mechanics` 的宗門世界後段內容要求，並更新 `client-interface` 的可發現性要求。
- Validation: `openspec validate expand-sect-world-late-content-v3 --strict`、targeted tests、必要 Playwright smoke、`npm run typecheck`、`npm run build`、`git diff --check`。
