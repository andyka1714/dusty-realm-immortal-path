## 1. 規格與 checkpoint

- [x] 1.1 盤點技能書 metadata、商店、掉落與圖鑑 source tracing 現況
- [x] 1.2 建立 OpenSpec proposal / delta，明確記錄不需要 migration
- [x] 1.3 驗證並提交 proposal checkpoint

## 2. 測試先行

- [ ] 2.1 新增 skill manual routing regression，驗證 formal core manual 都有 concrete route
- [ ] 2.2 擴充 source tracing regression，驗證 shop / elite / boss / inheritance 來源能顯示具體名稱
- [ ] 2.3 擴充 coverage regression，避免 route 指向 retired manual 或 missing item

## 3. 實作

- [ ] 3.1 新增集中式 `skillManualRouting` helper，從既有 catalog 推導 route
- [ ] 3.2 讓 Compendium skill source tracing 接入 routing helper
- [ ] 3.3 保持商店、敵人掉落與技能 metadata 為正式來源，不新增手寫圖鑑 registry

## 4. 文件與驗證

- [ ] 4.1 更新 gameplay / balance tracking，記錄 v4 scope 與不需要 migration
- [ ] 4.2 跑 targeted unit tests、Playwright smoke、typecheck、build、OpenSpec validate 與 `git diff --check`
- [ ] 4.3 完成後更新 tasks 狀態並提交 implementation checkpoint
- [ ] 4.4 Archive OpenSpec，驗證並提交 archive checkpoint
