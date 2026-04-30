# Change: 建立人形 Sprite 標準化管線

## Why

目前男女凡人走路素材已暴露出同一類根因：AI 生成圖與切圖後處理沒有一套強制的人形尺寸規格，導致男女高度不一致、向上髮型被切掉、側面列位移與雜邊殘留。若繼續逐張修補，未來玩家角色與 NPC 都會重複產生相同問題。

## What Changes

- 新增人形角色 sprite 標準，適用於 player 與 NPC 的 map / walk token。
- 定義 96x96 frame、4x4 walk sheet、方向順序、腳底線、中心線、目標角色高度與允收誤差。
- 定義 4x6 四方向 combat sheet，讓凡人 player 戰鬥時可依目前面向播放手持木劍攻擊動畫。
- 新增 humanoid sprite normalizer / QC gate，讓生成素材必須通過尺寸、腳底、中心、切邊、碎片與 chroma-key 檢查後才能寫入正式 assets。
- 重新生成男女凡人走路素材，並以相同標準作為 NPC 後續素材的範例。
- 重新生成男女凡人戰鬥素材，採每方向 6 格表達守勢、蓄力、出手、命中、收招與回守。
- 保留現有 asset registry 與 AdventureStage 讀取獨立 frame PNG 的方向，不再回到整張 sheet runtime 切片。

## Impact

- Affected specs: `client-interface`, `game-mechanics`
- Affected code: `data/assets/*`, `utils/playerSpriteAnimation*`, `public/assets/generated/characters/player/**`, sprite processing / QC scripts or docs
- Persistence: 不新增 persisted state；人形素材標準只影響 generated assets、registry metadata 與 rendering contract，不修改 LocalStorage schema、hydrate shape 或 migration。
