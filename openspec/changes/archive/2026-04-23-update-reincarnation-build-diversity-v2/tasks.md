## 1. Build catalog 與 planner 規則
- [x] 1.1 盤點現有 perk、soul seal、heirloom planner 與主動坐化入口
- [x] 1.2 新增 build lane / planner version / selected build identity 的資料設計
- [x] 1.3 補第二批 build-oriented perk / seal / heirloom constraint
- [x] 1.4 定義 lifetime stats 或 world memory 對 planner 的可讀加成邊界

## 2. UI 與 state flow
- [x] 2.1 更新 Reincarnation Hall preview 顯示 build identity cue
- [x] 2.2 確認非法配置仍會被阻擋並顯示原因
- [x] 2.3 補 planner version migration、舊 `rebirthConfig` 升級與非法配置清理

## 3. 測試、文件與驗證
- [x] 3.1 補 perk lane、planner validation、rebirth flow、migration regression
- [x] 3.2 補 Reincarnation Hall UI regression
- [x] 3.3 更新 reincarnation 文件與 v2 tracking docs
- [x] 3.4 驗證 `openspec validate update-reincarnation-build-diversity-v2 --strict`、targeted tests、`npm run typecheck`
