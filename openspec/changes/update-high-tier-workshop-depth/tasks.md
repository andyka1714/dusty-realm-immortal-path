## 1. 高階 recipe 與材料 sink
- [x] 1.1 盤點目前 `WORKSHOP_RECIPES`、高境界 consumables / equipment 與 route-specific material source 缺口
- [x] 1.2 擴充 `WorkshopRecipe` metadata，補 recipe tier、境界需求、route tags、品質提示與 mastery yield
- [x] 1.3 補第一批 `化神 -> 仙帝` 代表性高階丹方 / 器方與對應材料 sink

## 2. 專精、品質與 persistence
- [x] 2.1 擴充 `WorkshopState`，補 `masteryByDiscipline` 與 `specializationByDiscipline`
- [x] 2.2 更新 craft action，讓高階 recipe 能累積 mastery、產出指定品質或專精收益
- [x] 2.3 補舊存檔 migration，讓缺少新 Workshop 欄位的 current run 可安全讀取

## 3. UI、regression 與文件
- [x] 3.1 更新 `pages/Workshop.tsx`，顯示高階 recipe 的境界需求、材料來源、品質 / 專精 cue 與鎖定原因
- [x] 3.2 補 workshop action、Workshop UI、high-realm loop support 與 persisted migration regression tests
- [x] 3.3 更新 `docs/02_Gameplay/workshop.md`、`docs/06_Balance_Audit/01_修為與境界曲線審計.md` 與優先級追蹤文件
- [x] 3.4 驗證 `openspec validate update-high-tier-workshop-depth --strict`、targeted tests 與 `npm run typecheck`
