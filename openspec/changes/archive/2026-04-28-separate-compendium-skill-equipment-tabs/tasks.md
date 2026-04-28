## 1. 規格與測試

- [x] 1.1 驗證 OpenSpec change
- [x] 1.2 新增圖鑑 regression，確認萬物圖鑑不顯示功法與裝備分類
- [x] 1.3 新增裝備獨立 tab regression

## 2. 實作

- [x] 2.1 將萬物圖鑑分類選項排除功法與裝備
- [x] 2.2 將萬物圖鑑 item list 排除功法秘卷與裝備
- [x] 2.3 新增 `裝備法寶` tab，復用原本物品卡片資訊呈現

## 3. 驗證與收口

- [x] 3.1 跑 targeted tests
- [x] 3.2 跑 `npx tsc --noEmit`
- [x] 3.3 跑 `npm run build`
- [x] 3.4 跑 `git diff --check`
- [x] 3.5 更新 tasks、archive OpenSpec change 並提交
