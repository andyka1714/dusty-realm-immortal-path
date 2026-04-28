## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增凡界藏經閣 NPC regression，確認測試先失敗
- [x] 1.3 新增 ShopPanel 功法秘卷 copy regression，確認測試先失敗

## 2. 實作

- [x] 2.1 新增 `village_scripture_keeper` NPC 指向 `skill_shop_mortal`
- [x] 2.2 確認地圖能顯示該 NPC
- [x] 2.3 ShopPanel 對功法秘卷顯示「購買後至背包參悟」提示

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests、typecheck、build、e2e、OpenSpec validate 與 `git diff --check`
- [x] 3.2 更新 tracking docs，記錄不需要 migration 的理由
- [x] 3.3 提交 implementation 並 archive
