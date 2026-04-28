# Change: 規劃 RPG 主畫面 Layout v2

## Why

目前主畫面已有角色 HUD、任務追蹤、小地圖、底部 dock 與戰鬥操作，但缺少一份正式 layout 規格來約束後續擴充，容易讓圖鑑、功法、任務、地圖與戰鬥快捷互相搶入口。

## What Changes

- 固定主畫面資訊區：左上角色、左側任務、右上小地圖、右下戰鬥狀態、底部功能 dock。
- 明確區分圖鑑、功法面板、背包與藏經閣商店的職責。
- 不改 runtime；本 change 只吸收 layout 規格。

## Impact

- Affected specs: `client-interface`
- Affected code: OpenSpec specs / tracking docs
- Persistence: 不新增 persisted state。
