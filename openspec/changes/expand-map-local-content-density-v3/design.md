# Design: 後期地圖本地內容密度 v3

## Context

目前後期地圖已經有高境界怪物密度、宗門 world chapter NPC、route aftermath encounter、Workshop route material sink 與圖鑑 source tracing。缺口不是 runtime，而是地圖本地資訊太薄：玩家在 `160+` 地圖看得到路線章節 NPC，但較難理解該地區的通用狀態、材料線索，以及該地圖與 Workshop / encounter source 的關係。

## Goals

- 後期重點地圖有可被 regression 驗證的 local hook。
- local hook 使用現有 NPC / Quest / dialogue 模型，不引入新 engine。
- route material clue 能對上既有 route material：
  - `sword_path_starsteel`
  - `beast_path_bloodbone`
  - `mystic_path_starlotus`
- 仙帝地圖至少先補一張代表性地圖，讓後續 v4 終盤 loop 可以接續。

## Non-Goals

- 不新增 dialogue tree runtime。
- 不新增 LocalStorage migration。
- 不要求所有舊地圖一次補滿。
- 不重寫 `AdventureStage` 或 `QuestModal`。

## Approach

1. 在 `data/npcs.ts` 增加可重用的後期 map-local NPC 陣列。
2. 在 `data/maps.ts` 將 `181 / 182 / 180` 中至少一張仙帝地圖接上新增 NPC。
3. 在 `data/quests.ts` 增加 dialogue-only local quest / rumor quest，保持既有 `QuestType.Side` 與 `requirements: [{ type: "dialogue" }]`。
4. 加 regression test 驗證：
   - 每張重點地圖有 local / route-sensitive / material clue。
   - clue 文案包含對應地圖名稱、route label 與 material item id 或中文名。
   - NPC questIds 指向存在 quest，quest giver / submit target 有效。

## Migration

此 change 不改 persisted state。新增內容皆為靜態 catalog 資料；既有存檔若沒有接取這些 quest，會自然以未接取狀態顯示，不需要 sanitize 或 migration。
