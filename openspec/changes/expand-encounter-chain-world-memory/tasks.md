## 1. Event chain 與 world memory model
- [ ] 1.1 盤點現有 `EncounterEvent`、`EncounterState` 與 `resolvedEventIds` 的可延伸點
- [ ] 1.2 新增 `requiredResolvedEventIds`、chain id / step 與 pending context helper，避免把條件散寫在 selector
- [ ] 1.3 明確區分 run-scoped memory 與 soul-level world memory；若跨輪迴保存，必須落在 `soul`
- [ ] 1.4 更新 persistence migration，讓舊存檔補齊安全預設值並清理 malformed payload

## 2. 事件內容與 UI
- [ ] 2.1 補第一批中後期 chain-aware encounter，至少覆蓋 route / profession / sect 三種 gating
- [ ] 2.2 讓 `PendingEncounterPanel` 顯示 chain label、route / profession / sect cue 與選項後果提示
- [ ] 2.3 確認 Sect quest / Workshop source 只讀穩定 key，不在此線重做對方系統

## 3. 測試、文件與驗證
- [ ] 3.1 補 selector / required resolved ids / world memory / migration regression
- [ ] 3.2 補 pending encounter UI 與 GameShell regression
- [ ] 3.3 更新 encounter / world 文件與 `19_六線v2執行計畫.md`
- [ ] 3.4 驗證 `openspec validate expand-encounter-chain-world-memory --strict`、targeted tests、`npm run typecheck`
