## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增 GameHUD compact layout regression，確認測試先失敗
- [x] 1.3 新增 QuestTrackerHUD desktop placement regression，確認測試先失敗

## 2. 實作

- [x] 2.1 將角色 HUD stats 改為 compact grid
- [x] 2.2 調整 desktop 任務追蹤 top offset 對齊 compact HUD
- [x] 2.3 確認 mobile 任務入口不遮底部 dock

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests、typecheck、build、e2e、OpenSpec validate 與 `git diff --check`
- [x] 3.2 更新 tracking docs，記錄不需要 migration 的理由
- [x] 3.3 提交 implementation 並 archive
