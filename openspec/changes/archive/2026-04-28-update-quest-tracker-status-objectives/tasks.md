## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change。
- [x] 1.2 新增 quest tracker helper regression，覆蓋 `可接取`、`進行中`、`可回報` lifecycle。
- [x] 1.3 新增多目標 regression，覆蓋對話、討伐、提交物品與境界 progress rows。
- [x] 1.4 新增 QuestTrackerHUD regression，確認卡片顯示 lifecycle badge、目標列與導向文字。
- [x] 1.5 新增 e2e regression，確認玩家能在主畫面看到 `可接取` 與 `可回報` 狀態差異。

## 2. 實作

- [x] 2.1 擴充 `QuestTrackerItem` 為 derived view model，加入 `lifecycleStatus`、`lifecycleLabel`、`objectiveKind`、`progressRows`、`primaryActionLabel`。
- [x] 2.2 `buildQuestTrackerItems` 從 active/completed/inventory/majorRealm 推導任務狀態，不改 persisted state。
- [x] 2.3 `QuestTrackerHUD` 顯示狀態 badge、任務類型 badge、主要目標列與 progress rows。
- [x] 2.4 保留既有 navigation target 行為，讓 clickable card 仍能導向 NPC / map / condition。

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests / e2e / typecheck / build / OpenSpec validate / `git diff --check`。
- [x] 3.2 更新 tracking docs，記錄本 change 不需要 migration。
- [x] 3.3 完成後 archive change。
