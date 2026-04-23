## 1. Route chapter 盤點與資料設計
- [x] 1.1 盤點三宗 `task_04` 後的現有 quest、NPC、encounter 與地圖掛點
- [x] 1.2 設計三宗 `130+` route chapter 的最小資料組合
- [x] 1.3 定義章節結果如何提供 encounter memory 或 Workshop source cue（本切片以 route material reward cue 串接）

## 2. 章節內容與可發現性
- [x] 2.1 每宗新增一段 route chapter quest / NPC / encounter hook
- [x] 2.2 補 `130+` map-local NPC 或對話入口
- [x] 2.3 補 once-per-run milestone encounter，並保留 route label、risk / reward cue 與 material source cue

## 3. 測試、文件與驗證
- [x] 3.1 補 route chapter progression regression
- [x] 3.2 補 chapter discoverability、once-per-run encounter gating 與 route cue regression
- [x] 3.3 更新 `sect-world`、world story 與 v2 tracking docs
- [x] 3.4 驗證 `openspec validate expand-sect-world-route-chapters-v2 --strict`、targeted tests、`npm run typecheck`
