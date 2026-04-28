# Change: 擴充主線任務 Foundation

## Why

主畫面已有任務追蹤，但早期主線仍偏教學與宗門分支，缺少一條明確可被追蹤的「下一步主線」。需要先建立小而穩定的主線 foundation，讓玩家知道初期取得功法與入門前準備的方向。

## What Changes

- 新增一條早期主線任務，銜接防身利器後前往藏經閣了解功法秘卷。
- 任務獎勵給予修為 / 靈石，並在對話中引導玩家購買秘卷、背包參悟、功法面板裝備。
- 村落藏經閣 NPC 掛上該主線任務，讓 QuestTracker 能顯示下一步。

## Impact

- Affected specs: `client-interface`, `game-mechanics`
- Affected code: `data/quests.ts`, `data/npcs.ts`, quest data tests
- Persistence: 不新增 persisted state；只新增 static quest catalog。
