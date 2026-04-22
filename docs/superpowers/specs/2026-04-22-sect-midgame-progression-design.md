# 宗門中期成長線設計

日期：2026-04-22
主題：`add-sect-midgame-progression`

## 背景

目前遊戲中的宗門內容只正式做到三條線：

- 入門
- 加入宗門
- 第一個宗門試煉

這代表玩家在完成 `sect_*_task_01` 後，宗門身分就幾乎只剩商店與技能書入口，缺少從 `築基` 推進到 `金丹` 的持續成長線。這個缺口不是文件描述問題，而是 live data 的實際缺口：`data/quests.ts` 目前只有三個宗門各自的 `join + task_01`，`data/npcs.ts` 也只有對應長老，沒有中期承接 NPC。

## 目標

- 為三個宗門各補一條從 `築基 -> 金丹` 的中期成長線
- 讓玩家在加入宗門後，仍能透過宗門任務獲得持續的職業路線辨識
- 用現有 quest / NPC / boss / reward 結構落地，不引入第二套任務框架
- 為後續世界內容擴張留下乾淨的宗門主線承接點

## 非目標

- 不重寫 quest engine
- 不在這一批加入多條件任務、分支選項或事件系統
- 不在這一批擴張宗門到 `元嬰` 之後
- 不在這一批新增技能書來源體系或 route-specific 材料經濟

## 設計決策

### 1. 以簡單鏈式任務補內容，不碰任務引擎

`QuestModal` 現在對多 requirement 的完成判斷仍偏寬鬆，註解也直接指出目前只適合單階段或較簡單的 quest shape。因此這批宗門中期內容採用「單一主要 requirement 的鏈式任務」：

- `sect_*_task_02`
- `sect_*_task_03`

每個任務只使用一個主要 requirement，優先採 `kill`，必要 gating 用 `prerequisiteQuestId` 與 `level` 處理。

### 2. 每個宗門補一名中期承接 NPC

目前三宗只有長老在發任務，會讓所有宗門節奏都像「同一個 NPC 重複派單」。因此每個宗門補一個中期承接 NPC，讓宗門 identity 更清楚：

- 劍宗：巡山統領 / 執劍教習
- 獸莊：獵場監軍 / 血戰教頭
- 仙宮：外務使 / 靈脈司祭

這些 NPC 只負責 `task_02`、`task_03`，不取代既有長老與商店角色。

### 3. 用既有 boss / 地圖節點當錨點

中期宗門任務不新增專屬 boss 系統，直接綁定現有 boss 節點：

- 劍宗：`m32_b1`、`m62_b1`
- 獸莊：`m42_b1`、`m72_b1`
- 仙宮：`m52_b1`、`m82_b1`

這讓內容能直接接進現有世界節奏，並降低 scope。

### 4. 獎勵先用現有職業裝備，不追加技能書與新材料

這一批不發新的 manual reward。原因有二：

- 既有 boss 已經承接中期主動技能書掉落
- `skillBookCoverage` 與 manual source registry 已形成正式基線，若再加 quest manual reward，會把變更擴成另一條主線

因此這批任務獎勵以三宗門的既有裝備、經驗與靈石為主：

- `築基` 任務給對應職業的 `foundation` 裝備
- `金丹` 任務給對應職業的 `golden_core` 裝備

### 5. 先把宗門中期補厚，再談事件與世界劇情串接

這條 change 的目的，是先補上「加入宗門之後還有東西可走」的最低正式基線。事件系統、奇遇、宗門世界劇情里程碑仍是下一層 backlog，不應混在這次一起實作。

## 任務結構

每個宗門新增：

- 1 名 quest NPC
- 2 個中期任務

總計：

- 3 名 NPC
- 6 個任務

任務節奏建議：

1. `task_02`
   - 前置：`task_01`
   - 境界：`築基`
   - 內容：擊殺對應 `Foundation` / `築基` 段 boss
   - 獎勵：對應職業 `foundation` 裝備 2 件 + 經驗 + 靈石
2. `task_03`
   - 前置：`task_02`
   - 境界：`金丹`
   - 內容：擊殺對應 `GoldenCore` / `金丹` 段 boss
   - 獎勵：對應職業 `golden_core` 裝備 2 件 + 經驗 + 靈石

## 測試策略

需要新增或補強三類測試：

- quest data regression
  - 任務 ID、前置鏈、realm gate、giver / submit NPC、target boss 是否正確
- NPC wiring regression
  - 新 NPC 是否存在於對應宗門地圖，且 questIds 與實際 quests 對齊
- reward validity regression
  - 獎勵 item ID 是否存在，且 realm 段位與任務階段相符

## 風險與緩解

### 風險 1：任務仍然偏薄

這批只補 6 個任務，仍然不是完整宗門劇情線。

緩解：

- 明確把本批定位成「中期正式基線」
- 下一條宗門 / 世界內容 change 再承接事件、奇遇與里程碑劇情

### 風險 2：獎勵和 boss 掉落重疊感太高

如果 quest reward 和 boss drop 給得太像，玩家只會覺得是在重複拿同一套東西。

緩解：

- 任務獎勵以穩定補裝為主
- boss manual drop 保持作為路線技能突破點

### 風險 3：誤把這條 change 做成 quest engine 重構

這會直接把範圍炸開。

緩解：

- 嚴格限制任務 shape 為 simple chained quests
- 不在本 change 引入多 requirement completion overhaul

## 成功標準

- 玩家完成三宗任一入門試煉後，都還有明確的 `築基 -> 金丹` 宗門任務可接
- 三個宗門的中期 quest NPC、任務文本與獎勵有明顯職業差異
- 不需要改 quest engine，就能完整跑通宗門中期內容
- OpenSpec、測試與追蹤文件同步更新，這條主線能獨立實作與驗證
