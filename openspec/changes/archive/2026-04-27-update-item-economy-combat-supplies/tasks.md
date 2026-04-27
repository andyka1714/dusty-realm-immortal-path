## 1. OpenSpec 與現況盤點

- [x] 1.1 讀取 `data/shops.ts`、`data/items/consumables.ts`、`store/slices/characterSlice.ts`、`pages/Inventory.tsx`、`pages/Adventure.tsx`
- [x] 1.2 確認第一版不新增 persisted combat resource，不需要 migration
- [x] 1.3 驗證 `openspec validate update-item-economy-combat-supplies --strict`

## 2. 商店與補給資料

- [x] 2.1 先補 failing tests：`general_store_mortal` 不可為空、商店 item id 必須存在、基礎補給 effect 必須可讀
- [x] 2.2 補凡人雜貨店基礎補給，例如 `qi_pill / heal_pill`
- [x] 2.3 規劃並補必要的低階 / 中期恢復品資料，避免只剩單一回春丹
- [x] 2.4 確認 ShopPanel 顯示價格、stock、effect 文案與購買限制

## 3. 補給使用語意

- [x] 3.1 先補 failing tests：`heal_hp / heal_mp / full_restore` 不得被 silently ignored 後仍扣道具
- [x] 3.2 將 `consumeItem` 拆清楚：角色永久效果留在 character slice，戰鬥 / 探索補給效果交給可測 bridge 或 thunk
- [x] 3.3 第一版至少讓 `heal_hp` 與 `full_restore` 對正式可見 HP resource 產生效果
- [x] 3.4 若 `heal_mp` 尚無正式 MP resource，必須在 UI 阻擋並顯示原因，不能消耗道具

## 4. UI 與文件

- [x] 4.1 更新 Inventory 使用按鈕與不可用原因
- [x] 4.2 更新 ShopPanel 補給品 effect 顯示與購買後流程
- [x] 4.3 更新 `docs/04_Items/01_Overview.md`、`docs/04_Items/04_Consumables.md`、`docs/04_Items/05_DropSystem.md`、`docs/02_Gameplay/inventory.md`
- [x] 4.4 在 tracking docs 明確記錄 schema change 為 `no`；若實作新增 persisted state，先回頭改 spec 與 migration tasks

## 5. 驗證與收口

- [x] 5.1 跑 shop / consumable / inventory / adventure targeted tests
- [x] 5.2 跑必要 Playwright smoke，確認購買與使用補給不破壞 mobile layout
- [x] 5.3 跑 `npm run typecheck`、`npm run build`、`git diff --check`
- [x] 5.4 完成後更新 tasks 狀態、回寫 base specs、提交，再 archive
