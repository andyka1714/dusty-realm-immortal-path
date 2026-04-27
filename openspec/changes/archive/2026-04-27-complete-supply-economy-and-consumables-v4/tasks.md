## 1. 規格與 checkpoint

- [x] 1.1 盤點現有商店、補給資料、Inventory / Adventure 使用路徑與 UI 顯示
- [x] 1.2 建立 OpenSpec proposal / delta，明確記錄不需要 migration
- [x] 1.3 驗證並提交 proposal checkpoint

## 2. 測試先行

- [x] 2.1 擴充 shop catalog regression，檢查所有商店非空且 item id 存在
- [x] 2.2 擴充 consumable runtime regression，覆蓋 `heal_mp`、`full_restore` 雙資源與缺資源阻擋
- [x] 2.3 擴充 Inventory regression，鎖住 recovery consumable 不得在沒有 runtime handler 時扣道具
- [x] 2.4 擴充 Shop / Inventory UI regression，鎖住 effect label 與不可用原因

## 3. 實作

- [x] 3.1 補齊空商店或修正 shop description，使商店 catalog 不再出現空列表
- [x] 3.2 抽出共用 consumable effect label formatter，供 Shop / Inventory 顯示共用
- [x] 3.3 調整 Inventory recovery 使用路徑，讓 runtime handler 負責套用資源變化與扣道具
- [x] 3.4 保持 `characterSlice.consumeItem` 只處理角色永久 / 成長效果，不把 recovery effect 當成已套用

## 4. 文件與驗證

- [x] 4.1 更新 gameplay / balance tracking，記錄 v4 scope 與不需要 migration
- [x] 4.2 跑 targeted unit tests、Playwright smoke、typecheck、build、OpenSpec validate 與 `git diff --check`
- [x] 4.3 完成後更新 tasks 狀態並提交 implementation checkpoint
- [x] 4.4 Archive OpenSpec，驗證並提交 archive checkpoint
