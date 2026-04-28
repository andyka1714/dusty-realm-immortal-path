# Change: 新增角色功法裝備面板

## Why

底部 `功法` 目前開啟的是萬界圖鑑的功法資料庫，無法表達玩家已學哪些功法、哪些被動正在生效，以及戰鬥時要使用哪個主動功法。

## What Changes

- 新增角色功法面板，顯示已學主動術式與被動心法。
- 新增 `equippedActiveSkillId` persisted state，讓玩家選擇戰鬥使用的主動功法。
- 戰鬥選招優先讀取已裝備主動功法，非法或缺失時 fallback 到既有最高階主動功法。
- 底部 `功法` 入口改開角色功法面板；圖鑑仍保留所有功法來源查詢。

## Impact

- Affected specs: `game-mechanics`, `client-interface`, `client-persistence`
- Affected code: `types.ts`, `characterSlice`, persisted migration, battle skill selection, `GameShell`, new `SkillPanel`, tests
- Persistence: 新增 `current.character.equippedActiveSkillId`，必須補 migration / hydrate sanitize。
