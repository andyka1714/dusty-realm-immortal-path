# Change: 移除正式 HUD 多餘小地圖狀態與原型切換

## Why

右上小地圖下方的狀態卡與相鄰的像素原型切換按鈕佔用畫面，且狀態卡資訊與既有地圖入口、右側地名標籤和地圖面板重複。像素原型切換屬於開發用途，不應出現在正式玩家 HUD。

## What Changes

- 移除 Adventure 主畫面右上小地圖下方的 compact status card。
- 移除正式 HUD 中的像素原型切換按鈕。
- 保留右上小地圖入口與座標提示。
- 保留自動戰鬥雙劍按鈕，因為它是正式戰鬥流程控制。

## Impact

- Affected specs: `client-interface`
- Affected code: `pages/Adventure.tsx`, shared UI e2e expectations
- Persistence: 不新增 persisted state。
