# Change: 優化圖鑑來源追蹤彈窗

## Why
目前裝備法寶的來源 badge 未依普通、精英、首領怪物分色，`+更多` 彈窗離開觸發文字就消失且內容過窄過長，Workshop 文案也不夠直覺。

## What Changes
- 掉落來源依怪物類型上色：普通灰色、精英藍色、首領紅色。
- `+更多` 彈窗改為較寬、固定最大高度、可滾動且可停留閱讀的分組來源面板。
- 彈窗依掉落、商店販賣、工坊製作、工坊用途、奇遇路線分組，以 badge 呈現來源。
- 品質 badge tooltip 只在 hover 實際品質字時顯示，不因 hover 整張卡片而全部出現。

## Impact
- Affected specs: `client-interface`
- Affected code: `components/Compendium`, `components/game/GameTooltip`, `components/game/GameHintBubble`, `sourceTracing` tests
- Persistence: 只調整圖鑑 UI 與來源文案，不影響 LocalStorage schema、hydrate shape 或 persisted catalog，因此不需要 migration。
