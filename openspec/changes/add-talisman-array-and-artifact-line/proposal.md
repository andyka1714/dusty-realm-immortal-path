# Change: 建立符籙、陣盤與法寶物品線

## Why

修仙遊戲後期需要超出裝備與丹藥的物品語彙。符籙、陣盤、法寶與器靈能支撐戰鬥、突破、洞府與高階任務。

## What Changes

- 定義符籙、陣盤、法寶、器靈 taxonomy。
- 第一階段只建立規格與資料入口，不做複雜召喚戰鬥 runtime。
- 後續可延伸法寶裝備欄、器靈養成與陣盤消耗。

## Impact

- Affected specs: `game-mechanics`
- Affected code: future item categories, combat runtime, workshop, persistence
- Persistence: 第一階段不新增 schema；法寶裝備欄或器靈養成需另開 migration。
