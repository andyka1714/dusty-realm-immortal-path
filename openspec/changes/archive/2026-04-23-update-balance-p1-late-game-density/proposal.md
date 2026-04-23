# Change: 啟動 P1 後期平衡、內容密度與掉落主題化主線

## Why
`update-battle-p0-gap-closure` 已完成 battle 語意與高境界技能事件補完，但審計文件仍保留一批明確屬於 `P1` 的後續工作：`化神 -> 仙帝` 的內容密度明顯縮編、普通怪掉落在聚合期過於全混池、以及三職業在後段境界仍需要再做輸出 / 生存係數收斂。

如果這批工作不另外開主線，會再次散落在 `02_戰鬥與裝備曲線審計`、`07_路線分流與主題掉落設計`、`16_下一輪執行優先級Checklist` 與 battle regression tests 之間，無法明確驗證「高境界內容有沒有真的變厚、普通怪掉落有沒有更偏主題、後段 Boss 門檻有沒有維持」。

## What Changes
- 建立 `P1` 主線，專門處理 `化神 -> 仙帝` 的內容密度、普通怪主題掉落與後段三職業係數收斂
- 擴充高境界地圖密度，補上從 `SpiritSevering` 起的額外壓力圖 / 精英圖，不再讓後段每境界幾乎只剩單一路徑的兩張圖
- 讓高境界普通怪掉落從「全混池」收斂為「主題混融池」，保留聚合期混合感，但不再完全失去路線辨識
- 補上後段三職業係數與跨境界挑戰的 regression tests，驗證同境界 Boss 仍是門檻、高一境界 Boss 不應穩定通關
- 同步更新 `docs/06_Balance_Audit/02_戰鬥與裝備曲線審計.md`、`docs/06_Balance_Audit/07_路線分流與主題掉落設計.md`、`docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`

## Impact
- Affected specs: `game-mechanics`
- Affected code: `data/maps.ts`、`data/enemies/common.ts`、`data/enemies/elite.ts`、`data/progression/*.ts`、`utils/battleStats.ts`、battle/progression 測試
- Affected docs: `docs/06_Balance_Audit/02_戰鬥與裝備曲線審計.md`、`docs/06_Balance_Audit/07_路線分流與主題掉落設計.md`、`docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`

## Non-Goals
- 不處理 `P2` 的技能書來源體系深化、retired/duplicate 大規模裁剪或同場技能特效演出
- 不重開 battle core 模組化主線；本批工作聚焦在高境界內容、掉落與數值
- 不改動 `P0` 已完成的 status / visibility 語意
