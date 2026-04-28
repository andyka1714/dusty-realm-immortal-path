# Change: 新增通用功法並統一功法圖鑑卡片

## Why

`功法神通` 的卡片呈現與 `裝備法寶` 不一致，且 `通用` 分頁目前沒有正式功法，玩家會誤以為資料未完成或通用功法線不存在。

## What Changes

- 將功法圖鑑卡片調整為接近裝備卡片的資訊結構與視覺密度。
- 新增一批正式通用功法，讓 `通用` 分頁依境界顯示內容。
- 讓通用主動功法可被任一職業裝備並被戰鬥選招使用。
- 保留 `功法神通` 作為獨立 tab，不回收到 `萬物圖鑑`。

## Impact

- Affected specs: `client-interface`, `game-mechanics`, `client-persistence`
- Affected code: `components/Compendium/CompendiumModal.tsx`, `data/skills`, `data/items/manuals`, `data/shops`, `store/slices/characterSlice.ts`, `store/persistedStateMigration.ts`, `utils/battleEncounterSkillSelection.ts`, tests
- Persistence: 不新增 schema，但新增 skill/manual catalog id；hydrate 與 reducer 需允許通用主動功法。

