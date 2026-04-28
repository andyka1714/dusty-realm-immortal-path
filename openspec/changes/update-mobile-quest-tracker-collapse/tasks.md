## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增 `QuestTrackerHUD` mobile 收合 / 展開 regression，確認測試先失敗
- [x] 1.3 新增或擴充 Playwright mobile smoke，確認測試先失敗

## 2. 實作

- [x] 2.1 實作 mobile 任務追蹤入口與 runtime-only 展開狀態
- [x] 2.2 確認 desktop 任務追蹤維持常駐顯示
- [x] 2.3 確認 mobile 展開層不遮擋 bottom dock、action wheel 與地圖 modal

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests、typecheck、build、e2e、OpenSpec validate 與 `git diff --check`
- [x] 3.2 更新 tracking docs，記錄不需要 migration 的理由
- [x] 3.3 提交 implementation 並 archive
