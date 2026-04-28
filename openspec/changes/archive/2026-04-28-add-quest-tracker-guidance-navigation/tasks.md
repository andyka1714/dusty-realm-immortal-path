## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change。
- [x] 1.2 新增 quest tracker helper regression，確認沒有 active quest 時顯示下一主線。
- [x] 1.3 新增 QuestTrackerHUD regression，確認 tracker item 可點擊且帶 navigation target。
- [x] 1.4 新增 e2e regression，確認任務追蹤貼近 compact HUD 且不重疊。

## 2. 實作

- [x] 2.1 擴充 `buildQuestTrackerItems`，加入 completed quests、main quest fallback 與 navigation target。
- [x] 2.2 `QuestTrackerHUD` 將卡片改為 button，點擊時發出 runtime-only quest navigation event。
- [x] 2.3 `Adventure.tsx` 監聽 quest navigation event，同地圖走 path，跨地圖進入目標地圖座標。
- [x] 2.4 將 desktop tracker anchor 改成貼近 compact HUD 下方。

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests / e2e / typecheck / build / OpenSpec validate / `git diff --check`。
- [x] 3.2 更新 tracking docs，記錄不需要 migration 的理由。
- [x] 3.3 完成後 archive change。
