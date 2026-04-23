## Context

輪迴 foundation 已經存在，但目前的 planner 規模仍偏小：

1. `DEFAULT_REINCARNATION_PERKS` 只有三個通用條目
2. `toggleSelectedHeirloom` 仍把遺珍選擇硬限制在單格
3. `Dashboard` 只在角色死亡時自動開啟 `Life Review`
4. `ReincarnationFlow` 雖有成本與剩餘功德預覽，但沒有更完整的 build lane / unlock lane 呈現

這代表下一批最有價值的工作，不是回頭重做 `soul/current` 分層，而是讓輪迴大殿真正變成一個可規劃下一世開局的正式 planner。

## Goals

- 讓玩家能在死亡之外，也可透過正式 `主動坐化` 入口進入輪迴流程
- 讓輪迴 hall 擁有足夠的 planner 深度，而不只剩三個通用 perk
- 讓遺珍繼承從固定單格擴成可規劃的 build slot
- 保持既有 `soul` save 對舊存檔可安全承接

## Non-Goals

- 不在這條 change 內把 `Workshop / 百業 / Encounter` 的收益直接乘進輪迴公式
- 不在這條 change 內實作輪迴次數影響 NPC / 世界劇情
- 不重做 `Life Review` 或 `GameShell` 的整體視覺風格

## Decisions

- `perk` catalog 第二批以「明確 build 方向 + 少量進階解鎖」為原則，不一次灌入大量內容
- 遺珍 slot 以 planner 可計算的欄位承接，而不是把多格邏輯散落在 UI 判斷
- `主動坐化` 走與死亡相同的 `Life Review -> Hall -> Rebirth` 流程，只是 `cause` 改為 `voluntary`
- 舊存檔進入新版後，必須自動補齊 baseline unlocked perks，並安全清理超出新規則的選擇

## Risks / Trade-offs

- 如果一次加太多 perk，會把這條線變成 balance 主線
  - Mitigation: 第二批只加一組可辨識的 planner perks，先把結構做對
- 如果多格遺珍沒有明確限制，早期周目可能被高品質 carry 直接壓垮
  - Mitigation: slot 上限先維持小規模，並透過 cost / perk 控制
- 如果主動坐化沒有門檻，玩家可能過早跳過當世內容
  - Mitigation: 設定最小條件，避免開局即自殺式刷輪迴

## Migration Plan

1. 擴充 `perk` 與 rebirth planner 型別
2. 在 `persistedStateMigration` 補齊新版 `soul` 欄位 bootstrap 與舊選擇清理
3. 更新 `Dashboard` 與 `ReincarnationFlow`
4. 最後補 regression、文件與 spec delta
