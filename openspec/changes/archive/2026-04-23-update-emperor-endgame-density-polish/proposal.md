# 變更：細修仙帝端內容密度、路線專屬感與後段門檻

## 為什麼

`P0 / P1 / P2`、retired skill 退場與 live-combat role polish 都已完成後，目前最明確的下一個 backlog，不是再回頭拆 battle core，也不是直接開 3D prototype。

審計文件現在留下的高優先缺口，集中在後段內容體感：

- `仙帝` 仍比其他高境界更薄，主線與壓力支線的密度不夠
- 高境界普通怪雖已進入主題混融池，但路線專屬詞條 / 材料感還不夠強
- 後段 regression 雖已落地，但只要再補地圖或怪物內容，就需要把 `仙帝` 端門檻重新固定下來

如果不另外開主線，這批問題會再次散落在 `02_戰鬥與裝備曲線審計.md`、高境界敵人資料與 regression tests 之間，沒有明確的完成定義。

## 這次要改什麼

- 補強 `仙帝` 端地圖的內容密度、精英 / Boss 壓力與主線 / 支線節奏
- 讓 `仙帝` 高境界普通怪與精英怪更有路線專屬詞條、材料與掉落辨識度
- 固定 `仙帝` 端 representative build 的 regression 門檻，避免後續微調又讓終盤失去壓力
- 同步更新後段平衡審計文件與 tracking docs

## 影響範圍

- Affected specs:
  - `game-mechanics`
- Affected code:
  - `data/maps.ts`
  - `data/enemies/common.ts`
  - `data/enemies/elite.ts`
  - `data/enemies/highRealmDensity.test.ts`
  - `data/enemies/highRealmTheme.test.ts`
  - `data/enemies/highRealmCommonDropTheme.test.ts`
  - `data/progression/highRealmBalanceRegression.test.ts`
  - `docs/06_Balance_Audit/02_戰鬥與裝備曲線審計.md`
  - `docs/06_Balance_Audit/16_下一輪執行優先級Checklist.md`
