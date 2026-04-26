## 1. OpenSpec 與 coverage 定義
- [x] 1.1 建立 `expand-encounter-content-density-v3` proposal、tasks 與 spec deltas
- [x] 1.2 驗證 `openspec validate expand-encounter-content-density-v3 --strict`

## 2. Encounter v3 內容與測試
- [x] 2.1 先補 failing tests：高境界 coverage floor、仙帝 route-specific event、existing late events cue completeness
- [x] 2.2 補 `仙帝` 三職業 route-specific 可重複 encounter
- [x] 2.3 回補既有高境界通用 encounter 的 presentation 與 choice cue tags
- [x] 2.4 更新 high realm loop support 代表事件與 regression

## 3. UI QA 小線
- [x] 3.1 補 pending encounter panel regression，確認新 v3 事件 cue 可讀
- [x] 3.2 補 Playwright mobile modal / canvas QA，避免 shared UI 再出現 overflow 或黑畫面回歸

## 4. 文件與驗證
- [x] 4.1 更新 gameplay / priority tracking 文件，明確記錄 v3 scope 與不需要 migration
- [x] 4.2 跑 targeted unit tests、Playwright smoke、typecheck、build 與 `git diff --check`
- [x] 4.3 完成後更新 tasks 狀態並提交
