# Change: 調整 Adventure HUD 佈局

## Why

主遊戲畫面目前已有左上 `GameHUD`、右上小地圖、底部 dock 與大型戰鬥快捷列，但資訊層級仍不像正式 RPG HUD。使用者希望左上能直接看到角色頭像槽、名稱、境界、等級、HP、MP、戰力；底部 dock 承接主要功能入口；大型戰鬥快捷列則弱化為場景操作輔助。

## What Changes

- 左上 `GameHUD` 升級為角色狀態卡：暫代 avatar、名稱、境界、derived Lv、HP、MP、戰力與活動狀態。
- 底部 `FloatingDock` 新增 `功法` 與 `地圖` 入口；`功法` 開啟圖鑑功法 tab，`地圖` 觸發 Adventure 地圖 modal。
- 右上小地圖保留地圖語意，utility buttons 收斂為地圖 / 掛機相關控制，debug pixel toggle 不作為正式玩家入口。
- Adventure 的大型 `戰鬥快捷列` 改成小型技能輪 / action wheel，避免和底部 dock 互搶版面。
- 補 component / Playwright regression，驗證 HUD 資訊、dock 入口與大型快捷列不再以寬面板佔據底部。

## Impact

- Affected specs: `client-interface`, `game-mechanics`, `client-persistence`
- Affected code: `components/game/GameHUD.tsx`, `components/game/FloatingDock.tsx`, `components/game/GameShell.tsx`, `pages/Adventure.tsx`, tests
- Persistence: 不新增 persisted state；Lv、HP、MP、戰力與入口狀態都由既有 character、inventory、adventure runtime 與 UI state 推導，不需要 migration。
