## 1. 規格與資料盤點

- [x] 1.1 確認後期地圖 160 / 170 / 仙帝代表地圖目前 NPC 與 quest 缺口
- [x] 1.2 建立 OpenSpec proposal / design / delta，明確記錄不需要 migration
- [x] 1.3 提交 proposal checkpoint

## 2. 測試先行

- [x] 2.1 新增 map-local density regression，先驗證缺少 local / route-sensitive / material clue
- [x] 2.2 驗證 questIds、giverId、submitNpcId 都能對應正式 catalog

## 3. 實作

- [x] 3.1 為 160 / 170 / 仙帝代表地圖補 local hook NPC
- [x] 3.2 補 profession 或 sect sensitive hook 與 Workshop material clue
- [x] 3.3 將仙帝代表地圖 NPC 接入 `MAPS`
- [x] 3.4 更新 compendium / map modal 可讀性 smoke 所需資料

## 4. 文件與驗證

- [x] 4.1 更新 balance audit / roadmap tracking，記錄 v3 scope 與不需要 migration
- [x] 4.2 跑 targeted tests、Playwright smoke、typecheck、build、OpenSpec validate 與 `git diff --check`
- [x] 4.3 完成後更新 tasks 狀態並提交
- [ ] 4.4 Archive OpenSpec 並提交 archive checkpoint
