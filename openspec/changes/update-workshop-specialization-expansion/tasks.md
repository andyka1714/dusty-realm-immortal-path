## 1. Recipe 擴量
- [x] 1.1 盤點現有高階 recipe、route-specific material 與缺口
- [x] 1.2 補第二批中高階 / 終盤丹方與器方，至少覆蓋 `alchemy` 與 `smithing`
- [x] 1.3 確認新 recipe 的材料來源、route tags、品質提示與 mastery yield 都可追蹤

## 2. 專精效果
- [ ] 2.1 定義第一批 `alchemy / smithing` specialization effect 資料
- [ ] 2.2 讓 craft action 套用專精效果，但不得繞過高階 route-specific material sink
- [ ] 2.3 補專精效果與 craft 結果 regression

## 3. UI、文件與驗證
- [ ] 3.1 更新 `pages/Workshop.tsx`，顯示目前專精、可選專精與 recipe 受影響 cue
- [ ] 3.2 補 Workshop UI / recipe data / action tests
- [ ] 3.3 更新 `docs/02_Gameplay/workshop.md` 與優先級追蹤文件
- [ ] 3.4 驗證 `openspec validate update-workshop-specialization-expansion --strict`、targeted tests、`npm run typecheck` 與 `npm run build`
