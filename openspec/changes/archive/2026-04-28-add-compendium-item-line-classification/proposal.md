# Change: 圖鑑新增物品線分類

## Why
目前萬界圖鑑的物品頁仍以「神兵法寶」命名並只按境界分段，無法承接已建立的功法、裝備、丹藥、煉丹材料、煉器材料、任務物品、地區特產、貨幣代幣、符籙、陣盤與法寶器靈等物品線。

## What Changes
- 將圖鑑物品頁調整為「萬物圖鑑」概念，保留境界分段與來源追蹤。
- 新增物品主分類規則與分類篩選，讓玩家可以按物品線瀏覽。
- 物品卡片顯示主分類與原本子類，不移除 description、品質與來源追蹤資訊。

## Impact
- Affected specs: `client-interface`
- Affected code: `components/Compendium`, `data/items/itemLineMetadata.ts` consumers, component tests
- Persistence: 不影響 LocalStorage schema、hydrate shape 或 persisted catalog，因此不需要 migration。
