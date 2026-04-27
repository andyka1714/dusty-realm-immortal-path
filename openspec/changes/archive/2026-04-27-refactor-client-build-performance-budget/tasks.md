## 1. 規格與盤點

- [x] 1.1 盤點目前 build chunk 組成與 warning 來源
- [x] 1.2 建立 OpenSpec proposal / design / delta，明確記錄不需要 migration
- [x] 1.3 提交 proposal checkpoint

## 2. 測試先行

- [x] 2.1 新增 build budget / Vite config regression
- [x] 2.2 新增或更新入口 lazy boundary regression

## 3. 實作

- [x] 3.1 調整 Vite chunk budget 與 manual chunk 分類
- [x] 3.2 將 pixel prototype preview 改為 query-gated lazy load
- [x] 3.3 確認正式 GameShell / panels / Adventure lazy path 不變

## 4. 文件與驗證

- [x] 4.1 更新 balance audit / tracking，記錄 chunk budget 與不需要 migration
- [x] 4.2 跑 targeted tests、Playwright smoke、typecheck、build、OpenSpec validate 與 `git diff --check`
- [x] 4.3 完成後更新 tasks 狀態並提交
- [x] 4.4 Archive OpenSpec 並提交 archive checkpoint
