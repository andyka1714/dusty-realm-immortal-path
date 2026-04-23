# Change: 將主介面改為全畫面遊戲殼層

## Why
目前主介面採用側邊欄切頁的網頁式佈局，與玩家對修仙 RPG / 桌機遊戲的操作預期不一致。使用者希望保留單一主畫面，並以浮動按鈕與浮動面板開啟角色、背包、洞府、圖鑑等功能，讓體驗更接近真正遊戲。

## What Changes
- 以全畫面主場景取代側邊欄切頁式導航
- 將 `Adventure` 作為主場景常駐渲染
- 新增 HUD、浮動快捷列、浮動面板容器
- 將 `Dashboard`、`Inventory`、`Workshop`、`Compendium` 改為由浮動按鈕開啟的面板
- 保留既有核心玩法與資料結構，不在本次改造中重寫戰鬥/地圖/背包邏輯

## Impact
- Affected specs: `client-interface`
- Affected code: `App.tsx`, `pages/Adventure.tsx`, `pages/Dashboard.tsx`, `pages/Inventory.tsx`, `pages/Workshop.tsx`, `components/Sidebar.tsx`, new game shell components
