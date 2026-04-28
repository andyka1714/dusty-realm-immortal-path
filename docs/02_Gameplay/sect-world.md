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

`expand-sect-world-late-content-v3` 把 route chapter 再推到 `渡劫 -> 仙人`：

- 三宗新增第三段 route chapter quest：
  - 凌霄劍宗：`sect_sword_world_chapter_03`，由 `劫雲荒原 (160)` 的 `world_sword_tribulation_envoy` 發起，送到 `接引仙殿 (170)` 的 `world_sword_immortal_witness`。
  - 萬獸山莊：`sect_beast_world_chapter_03`，由 `world_beast_tribulation_envoy` 發起，送到 `world_beast_immortal_witness`。
  - 縹緲仙宮：`sect_mystic_world_chapter_03`，由 `world_mystic_tribulation_envoy` 發起，送到 `world_mystic_immortal_witness`。
- `劫雲荒原 (160)` 與 `接引仙殿 (170)` 現在都有 map-local NPC hook，玩家可從任務與 NPC 對話看見下一步。
- 新增三個仙人期 once-per-run milestone encounter：
  - `sword_world_immortal_sword_oath`
  - `beast_world_immortal_blood_oath`
  - `mystic_world_immortal_star_oath`
- 這批 encounter 寫出 `sect:*:world-chapter-03` world memory tag，並以 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 作為 route material source cue。
- 本輪不新增 persisted schema，不需要 migration。

`expand-encounter-route-aftermath-v3` 收口方向是把 `sect:*:world-chapter-03` 從一次性 milestone 延伸成可重複 aftermath：

- aftermath 事件應讀取對應 `sect:sword:world-chapter-03`、`sect:beast:world-chapter-03` 或 `sect:mystic:world-chapter-03`，缺少 world memory 時不得出現在 selector。
- aftermath 事件必須是 repeatable，不以 `once_per_run` 支撐 v3 後續密度。
- pending encounter 需保留 `routeLabel / categoryLabel / chainLabel / memoryCue`，choice cue 需讓玩家在選擇前辨識穩定收益、材料來源或高風險收益。
- 本 change 只新增 catalog event、selector gate、presentation cue 與 choice reward；不新增 persisted schema、不變更 LocalStorage envelope、不需要 migration。

`expand-endgame-route-v5` 把 `sect:*:endgame-loop-v4` 轉成終盤後續內容，而不是讓 v4 帝冕成為最終靜態節點：

- 三宗新增 repeatable v5 aftermath encounter：
  - 凌霄劍宗：`sword_emperor_v5_heaven_sunder_afterpath`，讀取 `sect:sword:endgame-loop-v4`。
  - 萬獸山莊：`beast_emperor_v5_worldblood_afterpath`，讀取 `sect:beast:endgame-loop-v4`。
  - 縹緲仙宮：`mystic_emperor_v5_star_throne_afterpath`，讀取 `sect:mystic:endgame-loop-v4`。
- `歸墟裂界 (182)` 新增 `歸墟 v5 路諭師` 與 `歸墟 v5 冕爐師`，用 dialogue-only quest 把三條 `sect:*:endgame-loop-v4`、帝冕 follow-up recipe 與輪迴魂印提示接起來。
- v5 aftermath 仍是 repeatable encounter，不使用 `once_per_run` 支撐密度；choice cue 會顯示 route、風險、收益與材料來源。
- 本輪只新增 `Encounter / NPC / Quest / Workshop / Reincarnation` catalog 與 derived UI copy，不新增第二套 quest engine，不新增 persisted schema，也不需要 migration。

## 驗證

- `data/sectLateProgression.test.ts` 覆蓋後段 quest、NPC 與 reward / dialogue 對齊。
- `data/encounters.test.ts` 覆蓋 late sect milestone 的 route gating、cue tags 與 resolved state 行為。
- `data/sectWorldStoryBranch.test.ts` 覆蓋 Phase 2 / v2 / v3 世界章節 quest / NPC / map / encounter 對齊。
- `components/game/PendingEncounterPanel.test.tsx` 覆蓋 v3 aftermath 在 pending panel 顯示 route、category、chain、memory 與 choice cue tags。
- `data/mapLocalContentDensity.test.ts` 覆蓋歸墟裂界 v5 NPC、quest、Workshop clue 與 route memory text。
- `data/contentAuthoringAudit.test.ts` 覆蓋 v5 aftermath、Workshop follow-up、map-local clue 與輪迴魂印的 cross-catalog 對齊。

## 下一步

- 若要繼續擴張，下一步應把 `chapter_03` 的 world memory tag 接給更多後續 encounter、Workshop source 或輪迴 route perk，但仍應避免新增第二套 quest engine；若只是讀取既有 `soul.worldMemoryTags`，仍不需要 migration。
