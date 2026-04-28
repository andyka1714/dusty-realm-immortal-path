# Change: 新增 Adventure 任務追蹤 HUD

## Why

Adventure 主畫面目前沒有任務追蹤欄，玩家需要打開 NPC 或任務相關介面才知道目前下一步。左側任務追蹤能承接主線、宗門與支線進度，讓主畫面資訊架構更完整。

## What Changes

- 新增 derived quest tracker helper，從既有 `QUESTS` 與 `quest.activeQuests` 推導排序、類型與進度文字。
- 在 `GameShell` 的 Adventure 主畫面左側顯示任務追蹤 HUD。
- mobile 版維持低佔用，不新增 persisted pin state。
- 補 helper、component 與 Playwright regression。

## Impact

- Affected specs: `client-interface`
- Affected code: `utils/questTracker.ts`, `components/game/QuestTrackerHUD.tsx`, `components/game/GameShell.tsx`, tests
- Persistence: 不新增 persisted state；追蹤內容完全由既有 quest state 推導。
