# 宗門後段與世界里程碑

`expand-sect-world-late-progression` 已完成，這一輪正式把三宗 `元嬰+` 後段任務、宗門 hub NPC 與 world milestone encounter 接回同一條路線。

## 已落地內容

- 三宗 `task_04` 已接到 `元嬰` / `化神` 里程碑，並沿用既有 `Quest / NPC / Encounter` 結構。
- 宗門 hub NPC 仍以 questIds / dialogue 承接後段任務，不另開第二套任務框架。
- route-specific world encounter 已依 profession 與 completed quest gating 解鎖。

## 驗證

- `data/sectLateProgression.test.ts` 覆蓋後段 quest、NPC 與 reward / dialogue 對齊。
- `data/encounters.test.ts` 覆蓋 late sect milestone 的 route gating、cue tags 與 resolved state 行為。

## 下一步

- 下一個可開案主線改為 `high-tier workshop depth`。
