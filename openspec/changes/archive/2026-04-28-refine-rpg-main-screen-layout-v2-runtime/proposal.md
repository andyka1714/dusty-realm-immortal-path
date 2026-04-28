# Change: 收口 RPG 主畫面 Layout v2 Runtime

## Why

主畫面 layout v2 已經固定資訊架構，但 runtime 仍缺少穩定的右上小地圖資訊層與右下功法快捷狀態，mobile viewport 也需要明確避免任務、dock、戰鬥快捷互相遮擋。

## What Changes

- 右上小地圖補上 compact map status，顯示目前地圖、座標、附近妖獸與 Boss 狀態。
- 右下 action wheel 補上目前目標、裝備主動功法、靈力消耗與可用狀態摘要。
- mobile viewport 使用更低佔用的戰鬥快捷狀態，避免遮住 bottom dock 與任務收合入口。
- 補 component / e2e regression，確認主畫面 layout v2 runtime 有穩定 selector。

## Impact

- Affected specs: `client-interface`
- Affected code: `pages/Adventure.tsx`, e2e shared UI smoke
- Persistence: 不新增 persisted state；所有資訊由既有 map / combat / character runtime 推導，不需要 migration。
