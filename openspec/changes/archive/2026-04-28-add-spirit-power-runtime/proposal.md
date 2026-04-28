# Change: 新增正式靈力 runtime

## Why

玩家 stats 已能推導 MP，補給 helper 也支援 `heal_mp / full_restore`，但 Adventure 世界戰鬥仍缺可見 MP runtime，導致補靈丹與主動技能消耗沒有完整閉環。

## What Changes

- 在 Adventure 世界戰鬥加入 `worldPlayerMp` runtime。
- 主動術式消耗 MP，不足時阻擋施放並顯示原因。
- `heal_mp / full_restore` 可恢復 Adventure 可見 MP。
- HUD / 戰鬥面板顯示目前 MP。

## Impact

- Affected specs: `game-mechanics`, `client-interface`
- Affected code: `pages/Adventure.tsx`, `utils/consumableEffects.ts`, tests
- Persistence: 第一版不新增 persisted state；MP 是 Adventure runtime resource。
