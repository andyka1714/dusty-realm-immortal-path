# 宗門後段與世界里程碑

`expand-sect-world-late-progression` 已完成，`expand-sect-world-story-branches` Phase 2 進一步把三宗 `task_04` 後的路線接成可追蹤的世界章節。

## 已落地內容

- 三宗 `task_04` 已接到 `元嬰` / `化神` 里程碑，並沿用既有 `Quest / NPC / Encounter` 結構。
- 宗門 hub NPC 仍以 questIds / dialogue 承接後段任務，不另開第二套任務框架。
- route-specific world encounter 已依 profession 與 completed quest gating 解鎖。
- 三宗新增 post-`task_04` 世界章節任務：
  - 凌霄劍宗：`sect_sword_world_chapter_01`，由 `三界戰場 (120)` 的 `world_sword_battlefield_envoy` 發起，送到 `時光長河 (130)` 的 `world_sword_void_river_witness`。
  - 萬獸山莊：`sect_beast_world_chapter_01`，由 `world_beast_battlefield_envoy` 發起，送到 `world_beast_void_river_witness`。
  - 縹緲仙宮：`sect_mystic_world_chapter_01`，由 `world_mystic_battlefield_envoy` 發起，送到 `world_mystic_void_river_witness`。
- `隕仙深淵 (121)` 補了三宗 route-local Info NPC，讓玩家在 120 -> 121 -> 130 的路上看得到各路線的中繼文案。
- 新增三個煉虛世界章節 milestone encounter：
  - `sword_world_void_river_oath`
  - `beast_world_void_river_oath`
  - `mystic_world_void_river_oath`

`expand-sect-world-route-chapters-v2` 進一步把這條線延伸到 `130+` 後段：

- 三宗新增第二段 route chapter quest：
  - 凌霄劍宗：`sect_sword_world_chapter_02`，由 `萬法聖城 (140)` 的 `world_sword_sacred_city_envoy` 發起，送到 `無盡海 (150)` 的 `world_sword_endless_sea_witness`。
  - 萬獸山莊：`sect_beast_world_chapter_02`，由 `world_beast_sacred_city_envoy` 發起，送到 `world_beast_endless_sea_witness`。
  - 縹緲仙宮：`sect_mystic_world_chapter_02`，由 `world_mystic_sacred_city_envoy` 發起，送到 `world_mystic_endless_sea_witness`。
- `萬法聖城 (140)` 與 `無盡海 (150)` 現在都有 map-local NPC hook，玩家不需要只靠文件推測下一步。
- 新增三個合體後段 once-per-run milestone encounter：
  - `sword_world_endless_sea_oath`
  - `beast_world_endless_sea_oath`
  - `mystic_world_endless_sea_oath`
- 這批 encounter 會保留 route label、風險 / 收益 cue、route material reward cue，並寫出 `sect:*:world-chapter-02` 類 world memory tag，供後續 encounter / Workshop source 讀取。

## 驗證

- `data/sectLateProgression.test.ts` 覆蓋後段 quest、NPC 與 reward / dialogue 對齊。
- `data/encounters.test.ts` 覆蓋 late sect milestone 的 route gating、cue tags 與 resolved state 行為。
- `data/sectWorldStoryBranch.test.ts` 覆蓋 Phase 2 / v2 世界章節 quest / NPC / map / encounter 對齊。

## 下一步

- 若要繼續擴張，下一步應把 `chapter_02` 的 world memory tag 接給更多後續 encounter、Workshop source 或輪迴 route perk，但仍應避免新增第二套 quest engine。
