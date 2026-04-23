## 1. Route-specific material source
- [x] 1.1 盤點 `凌霄劍星鋼 / 縹緲星魂蓮 / 萬獸血骨殘材` 現有 source 與缺口
- [x] 1.2 補第二批世界 / encounter material source，維持 route label、境界條件與 profession 差異
- [x] 1.3 補 source regression，確認材料來源可追蹤且不退化成無條件通用掉落

## 2. Specialization unlock / switch gating
- [x] 2.1 為 `Alchemy / Smithing` 專精定義 unlock requirement 與 switch / reset cost 資料
- [x] 2.2 讓專精選擇走 guarded action 或共用 helper，阻止未達條件的直接切換
- [x] 2.3 補 regression，確認專精效果仍不減免 route-specific material sink

## 3. UI、文件與驗證
- [ ] 3.1 更新 `pages/Workshop.tsx`，顯示專精 unlock、鎖定原因、切換成本與材料來源 cue
- [ ] 3.2 補 Workshop UI / encounter / action tests
- [ ] 3.3 更新 `docs/02_Gameplay/workshop.md` 與優先級追蹤文件
- [ ] 3.4 驗證 `openspec validate expand-workshop-source-specialization-unlocks --strict`、targeted tests、`npm run typecheck` 與 `npm run build`
