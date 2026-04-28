# Change: 圖鑑功法與裝備維持獨立入口

## Why
目前「萬物圖鑑」把功法秘卷與裝備也列為分類篩選，會讓原本應該獨立瀏覽的功法與裝備被混入一般物品。

## What Changes
- 「功法神通」維持獨立圖鑑 tab，不再出現在萬物圖鑑分類篩選。
- 新增獨立「裝備法寶」圖鑑 tab，用來瀏覽裝備並保留品質、description、來源追蹤與原始子類。
- 「萬物圖鑑」只呈現丹藥、煉丹材料、煉器材料、任務物品、地區特產、貨幣代幣、符籙、陣盤、法寶器靈、突破物與其他。

## Impact
- Affected specs: `client-interface`
- Affected code: `components/Compendium`, component tests
- Persistence: 只調整圖鑑呈現與篩選，不影響 LocalStorage schema、hydrate shape 或 persisted catalog，因此不需要 migration。
