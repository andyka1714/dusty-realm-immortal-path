## 1. Planner core

- [ ] 1.1 擴充 reincarnation perk / planner 型別與 helper，支援進階 perk、遺珍 slot 與 unlock 條件
- [ ] 1.2 補 `utils/reincarnation` 與 `soulSlice` regression，覆蓋新 planner 規則

## 2. UI 與流程

- [ ] 2.1 在 `Dashboard` 補正式 `主動坐化` 入口，接入既有 `Life Review -> Hall -> Rebirth` 流程
- [ ] 2.2 擴充 `ReincarnationFlow`，顯示進階 perk、遺珍 slot 與更完整的起手 build 預覽

## 3. Persistence、文件與驗證

- [ ] 3.1 補 `persistedStateMigration` / `localStorage` regression，確保舊 `soul` save 可承接新版 planner
- [ ] 3.2 更新 `docs/02_Gameplay/reincarnation.md` 與 `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
- [ ] 3.3 驗證 `openspec validate update-reincarnation-build-planner --strict`、相關 targeted tests 與 `npm run typecheck`
