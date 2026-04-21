## 1. 洞府百業正式化
- [x] 1.1 擴充 `WorkshopState`，補齊煉丹 / 煉器 / 配方 / 當世增益所需結構
- [x] 1.2 把 `pages/Workshop.tsx` 的煉丹爐與煉器台從 placeholder 改成正式可操作 loop
- [x] 1.3 讓 `聚靈陣 / 丹藥 / 煉器產出` 能承接當世 cultivation 或 build progression

## 2. 事件與奇遇 loop
- [x] 2.1 建立正式 event / encounter pool 與選項式結果模型
- [x] 2.2 將時間推進與 event/encounter loop 接回 `timeActions` 或對應 action 流程
- [x] 2.3 讓奇遇 / 事件收益正式掛鉤修為、材料、丹藥、裝備或 route-specific 掉落

## 3. 平衡、文件與驗證
- [x] 3.1 對齊 `data/progression/balanceAudit.ts` 的高境界乘區預期，補對應 regression
- [x] 3.2 更新 `docs/02_Gameplay/workshop.md`、`docs/06_Balance_Audit/01_修為與境界曲線審計.md`
- [x] 3.3 在 `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md` 登記這條新主線
- [x] 3.4 驗證 `openspec validate add-workshop-and-event-loops --strict` 與相關測試
