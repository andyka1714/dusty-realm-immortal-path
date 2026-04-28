## 1. 規劃與基線

- [x] 1.1 建立本輪執行計畫文件，列出 shared panel hardening、清理與後續 v5 backlog 邊界
- [x] 1.2 驗證 OpenSpec change，確認 scope 與 migration 判斷有效

## 2. Shared Panel Regression

- [x] 2.1 擴充 Playwright geometry helper，能檢查 visible content 在 panel/section 內不被裁切
- [x] 2.2 補 `道途` action / guide / log / stats panel 幾何 regression
- [x] 2.3 補 `行囊` detail / equipment side panel 幾何 regression
- [x] 2.4 補 `洞府` recipe / specialization 與 `圖鑑` summary 不溢出的 shared panel regression

## 3. 本地產物清理

- [x] 3.1 收斂 `.gitignore`，避免本地 agent / Playwright / output 產物再次進入未追蹤清單
- [x] 3.2 清理目前工作區中的本地產物與舊草稿，保留正式 docs 與 code change

## 4. 文件與驗證

- [ ] 4.1 更新 Priority tracking，記錄本輪 scope、驗證結果與不需要 migration
- [x] 4.2 建立後續 v5 backlog 文件，避免把遠期內容任務塞進同一個 UI hardening change
- [ ] 4.3 跑 targeted Playwright smoke、unit tests、typecheck、build、OpenSpec validate 與 `git diff --check`
- [ ] 4.4 完成後更新 tasks 狀態、提交並 archive
