# Change: 新增 NPC 態度與商店折扣

## Why

NPC、quest 與 shop 已存在，但魅力、宗門身份與 route memory 尚未影響 NPC / 商店互動。需要 deterministic affinity 與折扣提示，先建立低風險閉環。

## What Changes

- 新增 NPC affinity / shop discount helper，從魅力、職業與已完成任務推導。
- ShopPanel 顯示態度與折扣來源，價格套用 deterministic discount。
- 不新增永久 NPC 好感 state。

## Impact

- Affected specs: `game-mechanics`, `client-interface`
- Affected code: `utils/npcAffinity.ts`, `components/adventure/ShopPanel.tsx`, tests
- Persistence: 不新增 persisted state；好感與折扣從既有角色和 quest state 推導。
