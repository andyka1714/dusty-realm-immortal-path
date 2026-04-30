## 1. 規格與設計

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 建立設計文件與 implementation plan

## 2. RED tests

- [x] 2.1 新增丹藥資料 coverage regression：低中境界必須包含修為、回血、回靈、歸元、破境輔助、戰鬥增益用途
- [x] 2.2 新增晉階物 Boss 掉落 regression：每個大境界 required item 都存在且由同境界 Boss 掉落
- [x] 2.3 新增恢復丹藥 5 秒共用 CD helper regression
- [x] 2.4 新增 Adventure 自動服丹 reducer / migration regression
- [x] 2.5 新增 Inventory / Adventure UI regression：顯示共用冷卻與自動服丹狀態

## 3. 實作

- [x] 3.1 補齊回靈丹、歸元丹、修為丹與破境輔助丹資料
- [x] 3.2 補齊商店與煉丹配方來源
- [x] 3.3 實作恢復丹藥共用 CD helper
- [x] 3.4 實作 Adventure 自動服丹設定、migration 與 runtime 使用流程
- [x] 3.5 更新背包與戰鬥補給 UI 文案

## 4. 驗證與收口

- [x] 4.1 跑 targeted tests
- [x] 4.2 跑 `npm test`
- [x] 4.3 跑 `npm run typecheck`
- [x] 4.4 跑 `npm run build`
- [x] 4.5 跑 `git diff --check`
- [x] 4.6 更新 tasks 與 docs
