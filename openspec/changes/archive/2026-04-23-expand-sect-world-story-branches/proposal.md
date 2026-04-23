# 變更：擴張宗門與世界後段章節分支

## 為什麼

宗門中期與 `task_04` 後段前哨已完成，但三宗故事目前主要把玩家推到 `三界戰場 (120)`，尚未把 `120 / 121 / 130+` 做成可追蹤的世界章節。化神之後仍偏向 encounter 與材料事件，缺少 map-local NPC、章節任務與世界劇情出口。

## 這次要改什麼

- 補 `task_04` 之後的世界章節任務，承接三宗進入 `120 / 121 / 130+`
- 在後段地圖補 map-local NPC 或對話掛點
- 新增 story-driven milestone encounter，避免後段只剩材料事件
- 補 world-story regression，鎖定 quest / NPC / map / encounter 對齊
- 同步更新宗門世界與世界地圖文件

## 影響範圍

- Affected specs:
  - `game-mechanics`
  - `client-interface`
- Affected code:
  - `data/quests.ts`
  - `data/npcs.ts`
  - `data/maps.ts`
  - `data/encounters.ts`
  - `data/sectWorldStoryBranch.test.ts`
  - `docs/02_Gameplay/sect-world.md`
  - `docs/03_World/story.md`

