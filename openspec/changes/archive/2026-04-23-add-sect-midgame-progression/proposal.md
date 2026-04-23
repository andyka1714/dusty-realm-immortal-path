# 變更：補齊宗門中期成長線

## 為什麼

目前宗門內容在正式資料上只做到「加入宗門 + 第一個試煉」，玩家完成 `sect_*_task_01` 後，宗門身分幾乎只剩商店與技能書入口，缺少從 `築基` 推進到 `金丹` 的持續成長線。

這不是單純文件 backlog，而是 live code 的內容缺口：`data/quests.ts` 仍只有三宗的 `join + task_01`，`data/npcs.ts` 也沒有承接中期節奏的 quest NPC。若不另外開案，宗門與世界內容擴張會繼續停在口頭規劃。

## 這次要改什麼

- 為劍宗、獸莊、仙宮各補 1 名中期 quest NPC
- 為三宗各補 2 個中期宗門任務，形成 `task_01 -> task_02 -> task_03` 的鏈式節奏
- 用現有 boss 與地圖節點承接 `築基 -> 金丹` 宗門任務，不新增第二套 quest 系統
- 以現有職業裝備、經驗與靈石作為任務獎勵，不擴張 manual source registry
- 補齊 quest / NPC / reward regression tests
- 同步更新追蹤文件與設計文件

## 影響範圍

- Affected specs:
  - `game-mechanics`
- Affected code:
  - `data/quests.ts`
  - `data/npcs.ts`
  - `components/adventure/QuestModal.tsx`
  - `pages/Adventure.tsx`
  - `data/quests.test.ts` 或對應 quest regression tests
  - `data/npcs.test.ts` 或對應 NPC wiring tests
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
  - `docs/superpowers/specs/2026-04-22-sect-midgame-progression-design.md`
