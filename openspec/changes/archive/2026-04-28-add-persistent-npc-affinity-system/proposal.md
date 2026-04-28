# Change: 新增永久 NPC 好感系統

## Why

目前 NPC affinity 是 deterministic projection，可支援第一版商店折扣，但無法記錄玩家與特定 NPC / sect 的長期關係。要支援任務後續、特殊商店、對話選擇與長期 reputation，需要正式 persisted affinity state。

## What Changes

- 新增 NPC / sect affinity persisted state。
- Quest reward、dialogue choice、shop transaction 或 route memory 可調整 affinity。
- ShopPanel / QuestModal 顯示關係等級、變化原因與折扣來源。
- 保留魅力、職業與宗門身份作為 deterministic baseline。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `types.ts`, quest / character state, `utils/npcAffinity.ts`, `components/adventure/ShopPanel.tsx`, `components/adventure/QuestModal.tsx`, tests
- Persistence: 新增 persisted NPC / sect affinity state，必須補 migration、hydrate sanitize 與 regression。
