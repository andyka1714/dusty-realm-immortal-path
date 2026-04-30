## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增 HUD 修為滿顯示突破按鈕 regression，確認測試先失敗
- [x] 1.3 新增共用突破彈窗大境界道具檢查 regression，確認測試先失敗

## 2. 實作

- [x] 2.1 抽出共用 `BreakthroughModal`
- [x] 2.2 將 `Dashboard` 改用共用突破彈窗
- [x] 2.3 將突破結果 log 監聽移到共用 hook，避免 HUD 入口缺 log 或 Dashboard 重複 log
- [x] 2.4 在 `GameHUD` 修為滿時顯示 `突破` 按鈕並開啟共用彈窗

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests
- [x] 3.2 跑 OpenSpec validate、typecheck、build、full test 與 `git diff --check`
- [x] 3.3 更新 tasks 完成狀態
