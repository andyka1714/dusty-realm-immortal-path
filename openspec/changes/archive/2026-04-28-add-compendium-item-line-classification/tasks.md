## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增物品分類 helper regression，確認測試先失敗
- [x] 1.3 新增圖鑑分類篩選與卡片標籤 regression，確認測試先失敗

## 2. 實作

- [x] 2.1 新增 `components/Compendium/itemClassification.ts`
- [x] 2.2 將圖鑑物品頁改為「萬物圖鑑」並加入分類篩選
- [x] 2.3 物品卡片顯示主分類與原始子類標籤

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests
- [x] 3.2 跑 `npx tsc --noEmit`
- [x] 3.3 跑 `npm run build`
- [x] 3.4 跑 `git diff --check`
- [x] 3.5 更新 tasks 狀態並 archive OpenSpec change
