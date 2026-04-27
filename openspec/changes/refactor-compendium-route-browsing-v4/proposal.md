# Change: 整理圖鑑路線瀏覽 v4

## Why

內容密度、來源追蹤、宗門路線、Workshop sink 與輪迴 hook 已快速擴量，但 `萬界圖鑑` 的瀏覽表面仍容易出現兩個問題：標題 / sticky 區塊干擾卡片閱讀，以及功法、宗門資料雖有初步 tabs，仍不夠明確地按職業、境界與路線用途掃描。玩家需要能從圖鑑快速回答「這個物品從哪來」、「這個功法屬於哪條職業線」、「這個宗門 route material 接到哪些系統」。

## What Changes

- 修正 `神兵法寶` tab 的 heading / scroll layout，避免 fixed 或 sticky 標題遮住物品卡。
- 強化 `功法神通` 的職業與境界分組，讓 `通用 / 劍修 / 體修 / 法修` 與境界段落更容易掃描。
- 強化 `宗門傳承` 的單宗聚焦 tabs，顯示 route material、world memory、encounter、Workshop 與 Reincarnation hook 摘要。
- 補 component regression 與 Playwright smoke，覆蓋 desktop / mobile shared panel 不溢出、不遮擋。
- 更新 tracking 文件與 tasks，明確記錄不需要 migration。

## Impact

- Affected specs: `client-interface`, `client-persistence`
- Affected code: `components/Compendium/CompendiumModal.tsx`、Compendium tests、Playwright shared UI smoke、tracking docs
- Persisted state: 不新增 LocalStorage schema、玩家圖鑑進度或 source registry；只改 UI derived layout 與現有 catalog 呈現，因此不需要 migration。
