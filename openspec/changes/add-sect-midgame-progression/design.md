## Context

目前三宗門在 live content 中只有：

- `sect_*_join`
- `sect_*_task_01`

`QuestModal` 的完成判斷對多 requirement 任務仍然偏寬鬆，註解也直接指出目前較適合 simple single-stage quest。因此這次變更若直接擴成多條件、多分支或事件化任務，會把 scope 擴成 quest engine overhaul，而不是內容補強。

## Goals

- 為三宗補上可正式遊玩的 `築基 -> 金丹` 中期成長線
- 讓宗門身分在加入後仍持續帶來職業路線辨識
- 用既有 boss、商店、裝備與 quest 狀態流完成落地
- 為下一輪宗門 / 世界內容擴張預留乾淨承接點

## Non-Goals

- 不重寫 quest engine requirement completion 邏輯
- 不加入 branching quest、encounter choice 或世界事件系統
- 不新增技能書 quest 獎勵與 manual source 類型
- 不把宗門內容一次擴到 `元嬰` 以上

## Decisions

- 任務 shape 採 simple chained quests，每個任務只保留單一主要 requirement
- 每個宗門新增 1 名專職中期 quest NPC，不把所有任務都塞回長老
- `task_02` 綁 `築基` 段 boss，`task_03` 綁 `金丹` 段 boss
- quest reward 只使用既有裝備、經驗與靈石，不碰 manual registry
- sect exclusivity 維持現狀，只沿用既有 `sect_*_join` 決定職業路線

## Risks / Trade-offs

- 只補 6 個任務，仍不足以構成完整宗門劇情長線
  - Mitigation: 把這批明確定義成 midgame baseline，後續 change 再接事件與世界內容
- 若 reward 給得過強，可能壓過 boss 掉落與商店裝備
  - Mitigation: 用「穩定補裝」而非「唯一畢業裝」定位任務獎勵
- 若臨時把 quest 做成多 requirement，容易撞到現有 QuestModal 限制
  - Mitigation: 嚴格限制 quest shape，不在本 change 擴張 completion model

## Migration Plan

1. 先補 design / proposal / tasks / spec delta，固定 scope
2. 再補 `data/quests.ts` 與 `data/npcs.ts`
3. 最後補 regression tests、驗證與追蹤文件
