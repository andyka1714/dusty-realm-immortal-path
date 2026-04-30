# Change: 新增 Adventure 常駐資源恢復

## Why
玩家在 Adventure 即時戰鬥中受到傷害或消耗靈力後，目前只有丹藥、擊殺回血或切圖重設會恢復資源，導致脫離戰鬥後氣血 / 靈力長時間停在低值。遊戲需要一個常駐、低頻率且可擴充的恢復週期。

## What Changes
- Adventure runtime 每 5 秒恢復一次玩家氣血與靈力。
- 氣血恢復包含基本恢復、角色屬性加成與既有 `regenHp` 加成。
- 靈力恢復包含基本恢復與角色屬性加成。
- 新增可疊加的 runtime recovery effect 模型，預留技能或丹藥提供「每個週期恢復固定量」的能力。
- 不變更 persisted state；恢復狀態仍留在 Adventure runtime local state。

## Impact
- Affected specs: game-mechanics
- Affected code: `pages/Adventure.tsx`, `utils/worldPlayerResourceRecovery.ts`, tests
- Persisted state: 不影響；不新增 Redux persisted shape 或 LocalStorage migration。
