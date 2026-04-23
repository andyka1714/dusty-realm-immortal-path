## Context

目前 live code 的宗門 / 世界內容有三個穩定基礎：

1. `data/quests.ts` 已有三宗入門、初階試煉、築基歷練與金丹真傳。
2. `data/npcs.ts` 已有三宗 hub NPC，且中期 NPC 已掛上 `sect_*_task_02 / 03`。
3. `data/encounters.ts` 已能依 `majorRealm / profession / completedQuestIds / resolvedEventIds` 選出 route-specific encounter。

缺口是 `元嬰+` 後，世界地圖雖有三路 route boss，並且在 `化神` 進入三界戰場 convergence，但宗門任務、NPC 與 encounter 掛點沒有繼續承接。

## Goals

- 讓三宗後段內容至少延伸到 `元嬰`
- 保留 `化神` 三界戰場作為後續 world milestone 的明確接續點
- 讓後段宗門任務明確指向現有 route boss / world map
- 讓世界里程碑內容能透過 NPC 或 encounter 被玩家看到
- 保持角色 / 怪物 / NPC 仍為既有文字 token，不引入 actor sprite 重構

## Non-Goals

- 不重寫 `QuestState` schema
- 不新增 narrative engine 或多分支劇情狀態機
- 不改宗門選擇規則或允許多宗門同時主線
- 不在這批開高階百業 recipe 分支

## Decisions

- 第一批後段宗門任務沿用現有 `Quest` 結構：`prerequisiteQuestId + level + kill + rewards + dialogue`
- `元嬰` 任務分別對齊現有 route boss：
  - 劍宗：`m92_b1`
  - 萬獸：`m102_b1`
  - 仙宮：`m112_b1`
- `化神` world milestone 不在第一批強制做完整長鏈，但新資料命名、dialogue 與文件必須明確承接 `120: 三界戰場`
- NPC 掛點優先加在三宗 hub，不新增 map attachment schema；如果需要 world NPC，先用 `data/maps.ts` 既有 `npcs` 回傳邏輯擴充
- world encounter 優先透過既有 selector 的 `requiredCompletedQuestIds` 接宗門後段任務，不新增 store migration
- 後段 route reward 第一批可先使用既有 `元嬰` 裝備、突破素材、靈石與修為；新增 manual source tier 留到後續技能書主線，避免把 scope 擴到 persistence / skill registry

## Risks / Trade-offs

- 若只補 quest，不補 NPC 掛點，玩家可能無法自然接到任務。
  - Mitigation: regression 必須檢查 quest id 已被 NPC 掛上。
- 若只補 reward，不補 route-specific encounter，宗門後段仍會像單次清單。
  - Mitigation: 至少補一批後段宗門 / world encounter，使用 completed quest gating。
- 若直接擴 schema，會拖到 persistence migration。
  - Mitigation: 先沿用現有 Quest / NPC / Encounter 結構。

## Migration Plan

不需要 persisted state migration。新增 quest / NPC / encounter data 後，舊存檔可自然在未完成任務狀態下看到新內容；已完成 `sect_*_task_03` 的玩家會直接符合後段任務前置條件。
