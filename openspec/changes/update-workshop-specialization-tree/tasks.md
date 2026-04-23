## 1. 專精樹資料與 state
- [ ] 1.1 設計 `Alchemy / Smithing` 專精樹資料模型，包含前置、互斥、解鎖與 reset 規則
- [ ] 1.2 擴充 `WorkshopState` 與 migration，保留舊存檔相容性
- [ ] 1.3 補專精樹 selector / helper，避免 UI 與 action 重複判斷規則

## 2. 效果、recipe 與 UI
- [ ] 2.1 擴充高階 recipe 與 route-specific material sink
- [ ] 2.2 讓 craft / specialization action 套用專精樹效果、前置與互斥規則
- [ ] 2.3 在 Workshop UI 顯示樹狀節點、鎖定原因、分支衝突、reset 操作與受影響 recipe cue

## 3. 測試、文件與驗證
- [ ] 3.1 補 data / action / migration / UI regression tests
- [ ] 3.2 更新 `docs/02_Gameplay/workshop.md`
- [ ] 3.3 驗證 `openspec validate update-workshop-specialization-tree --strict`、targeted tests、`npm run typecheck`、必要時 `npm run build`

