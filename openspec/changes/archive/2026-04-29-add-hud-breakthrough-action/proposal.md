# Change: 新增 HUD 直接突破入口

## Why
角色修為已滿時，玩家目前仍必須打開 `道途` 面板才能突破。主畫面 HUD 已經顯示修為狀態，應直接提供突破入口，減少操作路徑。

## What Changes
- 主畫面角色 HUD 在修為滿且可突破時，將修為數值改為 `突破` 按鈕。
- HUD `突破` 按鈕開啟與 `道途` 完全相同的突破彈窗。
- 大境界突破仍必須檢查對應突破道具，缺少道具時不得確認突破。
- 抽出共用突破彈窗，避免 HUD 與道途維護兩套突破 UI / 邏輯。

## Impact
- Affected specs: `client-interface`
- Affected code: `components/game/GameHUD.tsx`, `pages/Dashboard.tsx`, shared breakthrough modal / hook, tests
- Persistence: 不新增 persisted state；沿用既有 `character.isBreakthroughAvailable`、`lastBreakthroughResult` 與 inventory items。
