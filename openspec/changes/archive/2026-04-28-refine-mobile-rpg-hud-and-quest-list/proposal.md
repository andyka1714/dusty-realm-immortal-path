# Change: 調整 mobile RPG HUD 與任務列表

## Why

目前角色 HUD 已具備 RPG 狀態卡基礎，但修為、靈石、戰力、壽元以直列呈現，在 mobile viewport 會佔用過多畫面。任務列表也需要更穩定地貼合角色資訊下方。

## What Changes

- 將角色 HUD 下半部改成 compact stat grid。
- Desktop 任務追蹤貼齊角色卡下方。
- Mobile 保持任務收合入口，避免遮住底部 dock。
- 不新增 persisted state。

## Impact

- Affected specs: `client-interface`
- Affected code: `components/game/GameHUD.tsx`, `components/game/QuestTrackerHUD.tsx`, tests
- Persistence: 不新增 persisted state。
