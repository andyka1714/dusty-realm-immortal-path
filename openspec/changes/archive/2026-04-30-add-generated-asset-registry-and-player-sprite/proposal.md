# Change: 建立生成素材 Registry 並產出玩家素材

## Why

遊戲未來會使用 AI 生成素材在角色、怪物、NPC、地圖、物品與戰鬥效果上。如果沒有共用素材 registry，資料表會直接散落圖片路徑，造成替換、版本管理與風格一致性困難。

## What Changes

- 新增生成素材資料夾規範與設計文件。
- 新增 `AssetDefinition` 與 `assetRegistry`。
- 新增 fallback asset lookup，避免未知素材造成 UI 崩潰。
- 註冊第一個男性凡人主角素材 `character.player.mortal_male.v1`。
- 使用 `$generate2dsprite` 產出第一個玩家 walk sheet bundle。

## Impact

- Affected specs: `client-interface`, `game-mechanics`
- Affected code: `data/assets/*`, `public/assets/generated/**`, docs/tests
- Persistence: 不新增 persisted state；第一階段不修改 LocalStorage schema。
