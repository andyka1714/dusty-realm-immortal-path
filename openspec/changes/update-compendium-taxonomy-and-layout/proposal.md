# Change: 調整圖鑑分類與瀏覽版面

## Why

目前 `萬界圖鑑` 已能顯示境界、地圖、物品、功法與宗門資料，但資訊架構仍偏早期平鋪：`神兵法寶` 以 sticky 境界標題分段，容易遮住第一排物品卡；`功法神通` 全量平鋪，玩家只能逐卡辨識職業與境界；`宗門傳承` 則一次展開三宗長卡，行動版掃描成本偏高。這些問題會讓已補齊的資料內容難以被玩家理解。

## What Changes

- 重整 `CompendiumModal` 的 `神兵法寶` 分區，移除會遮卡片的 sticky realm heading，改為不覆蓋內容的分類 / filter / section header。
- 將 `功法神通` 改成可依 `職業 / 通用` 與 `境界` 掃描的瀏覽結構，沿用現有 formal core skill metadata，不新增技能資料模型。
- 將 `宗門傳承` 改成三宗 tabs 或等效 segmented navigation，讓玩家一次聚焦一個宗門，並在宗門內清楚看到人物、傳承功法與章節線索。
- 補桌面與 mobile 的圖鑑 regression / Playwright smoke，確認標題不遮內容、tab 可切換、文字不溢出。

## Impact

- Affected specs:
  - `client-interface`
- Affected code:
  - `components/Compendium/CompendiumModal.tsx`
  - `components/Compendium/CompendiumModal.test.tsx` 或既有圖鑑相關測試
  - `tests/e2e/shared-ui-foundation.spec.ts` 或新增 compendium e2e smoke
  - `docs/04_UI/components.md`
  - `docs/06_Balance_Audit/20_Android_UI驗證與下一階段Priority追蹤.md`

## Persisted State / Migration

- Schema change? `no`
- Persisted surface: not touched
- Migration / hydration sanitize: not needed，這條 change 只調整資料瀏覽與 layout，不改 LocalStorage schema、hydrate shape、item / skill / quest id。
- Regression coverage: UI render / Playwright 覆蓋即可，不需要 migration regression。
