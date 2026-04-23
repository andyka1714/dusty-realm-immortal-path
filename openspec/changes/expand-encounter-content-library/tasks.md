## 1. 覆蓋率盤點
- [x] 1.1 盤點現有 encounter 池的境界段、職業、宗門、里程碑覆蓋率
- [x] 1.2 建立 regression helper，固定每個主要境界段的最低事件覆蓋門檻

## 2. 內容擴張
- [x] 2.1 補 `元嬰 -> 合體 -> 大乘` 的可重複通用與 route-specific 事件
- [x] 2.2 補與 Workshop 材料來源、宗門路線或世界里程碑有關的高辨識度事件
- [x] 2.3 確認新增事件都有 `categoryLabel / routeLabel / cueTags` 或等效可讀提示

## 3. 測試、文件與驗證
- [x] 3.1 補 encounter content coverage regression
- [x] 3.2 補 pending / resolved flow 的相關回歸，確保新增事件不破壞既有流程
- [x] 3.3 更新 gameplay / audit 文件
- [x] 3.4 驗證 `openspec validate expand-encounter-content-library --strict`、targeted tests、`npm run typecheck`
