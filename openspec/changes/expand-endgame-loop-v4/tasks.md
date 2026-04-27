## 1. 規格與 checkpoint

- [x] 1.1 盤點既有 v3 aftermath、Workshop route source、輪迴 route hook 與主動坐化 UI
- [x] 1.2 建立 OpenSpec proposal / design / delta，明確記錄不需要 migration
- [x] 1.3 驗證並提交 proposal checkpoint

## 2. 測試先行

- [x] 2.1 新增終盤 encounter chain regression，先暴露 v4 endgame memory 與 route reward 缺口
- [x] 2.2 新增 Workshop 終盤 convergence sink regression，先暴露 recipe / source tracing 缺口
- [x] 2.3 新增輪迴 v4 route memory reward regression，先暴露魂印 / preview cue 缺口
- [x] 2.4 新增主動收束 UI regression，先暴露飛升 / 結局 / 主動重開語意 cue 缺口

## 3. 實作

- [x] 3.1 補三宗 `仙帝` v4 route aftermath 或 convergence encounter
- [x] 3.2 補高階 Workshop 終盤 sink，並確保 recipe、item source tracing 與 content audit 接得上
- [x] 3.3 補 v4 route memory 輪迴 reward 與 planner / preview cue
- [x] 3.4 補 Dashboard / Reincarnation UI 的主動收束語意 cue

## 4. 文件與驗證

- [x] 4.1 更新 gameplay / balance tracking 文件，記錄 v4 scope 與不需要 migration
- [x] 4.2 跑 targeted unit tests、Playwright smoke、typecheck、build、OpenSpec validate 與 `git diff --check`
- [x] 4.3 完成後更新 tasks 狀態並提交 implementation checkpoint
- [ ] 4.4 Archive OpenSpec，驗證並提交 archive checkpoint
