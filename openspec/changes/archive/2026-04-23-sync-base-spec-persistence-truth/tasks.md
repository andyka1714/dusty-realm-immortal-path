## 1. Base spec truth audit

- [x] 1.1 盤點 `client-interface / client-persistence / game-mechanics` 與目前 live code 的真實差距
- [x] 1.2 撰寫對應 spec delta，正式承認 `GameShell`、`Workshop`、遭遇事件與宗門中期 progression

## 2. Persistence 與 regression hardening

- [x] 2.1 補 `persistedStateMigration` / `localStorage` regression，覆蓋 legacy skill/manual migration、`encounter` hydration 與輪迴 reset 邊界
- [x] 2.2 視需要微調 persistence / migration 程式碼，讓行為與 formal baseline 對齊

## 3. 文件與驗證

- [x] 3.1 更新 `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
- [x] 3.2 驗證 `openspec validate sync-base-spec-persistence-truth --strict`
- [x] 3.3 執行相關 targeted tests 與 `npm run typecheck`
