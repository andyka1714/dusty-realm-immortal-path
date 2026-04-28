# Change: Mobile 任務追蹤收合

## Why

Adventure 主畫面已提供 desktop 任務追蹤欄，但 mobile viewport 仍缺低佔用入口與展開狀態。玩家在手機尺寸需要能快速查看 active quests，同時不遮擋 bottom dock、action wheel 與地圖 modal。

## What Changes

- `QuestTrackerHUD` 增加 mobile 收合入口與展開 overlay。
- 展開 / 收合狀態只存在目前 React runtime。
- mobile regression 檢查任務追蹤入口、展開內容與既有 HUD 不互相覆蓋。

## Impact

- Affected specs: `client-interface`
- Affected code: `components/game/QuestTrackerHUD.tsx`, `components/game/GameShell.tsx`, tests
- Persistence: 不新增 persisted state；不需要 migration。
