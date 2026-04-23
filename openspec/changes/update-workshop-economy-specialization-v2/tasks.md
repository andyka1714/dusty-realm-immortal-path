## 1. Mastery milestone 與 specialization leaf
- [x] 1.1 盤點現有 specialization tree 與 mastery 使用點
- [x] 1.2 新增第二層 specialization leaf 或 mastery milestone 定義
- [x] 1.3 確認互斥、reset、switch cost 不會繞過既有 tree 規則
- [x] 1.4 明確記錄本輪是否新增 persisted state；若否，說明沿用既有 migration 的理由
  - 本輪未新增 persisted state；mastery milestone 只由既有 `workshop.masteryByDiscipline` 推導，specialization leaf 沿用 `specializationTreeByDiscipline` / `specializationByDiscipline`，因此沿用現有 migration。

## 2. Recipe economy 與 material sink
- [x] 2.1 補中後期 / 終盤 recipe family
- [x] 2.2 每個新 recipe 必須有 routeTags、sourceHint、masteryYield 與 route-specific sink
- [x] 2.3 補至少一種新專精效果，例如副產物、品質保底或 tier-specific output cue，且不得減免高階 route-specific 材料

## 3. UI、測試與驗證
- [x] 3.1 更新 Workshop UI 顯示 mastery milestone、leaf effect、品質與 source cue
- [x] 3.2 補 recipe / action / UI / migration 相容 regression；若未改 schema，保留舊存檔相容測試即可
- [x] 3.3 更新 Workshop 文件與 v2 tracking docs
- [x] 3.4 驗證 `openspec validate update-workshop-economy-specialization-v2 --strict`、targeted tests、`npm run typecheck`
