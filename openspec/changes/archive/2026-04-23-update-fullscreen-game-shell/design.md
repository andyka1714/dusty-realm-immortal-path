## Context
現有應用使用 tab + sidebar 作為主導航。這種結構雖然便於開發，但不符合本專案要呈現的沉浸式單機遊戲體驗。使用者期望看到單一主畫面、常駐遊戲場景、以及由 HUD / 浮動面板驅動的操作模式。

## Goals / Non-Goals
- Goals:
  - 提供單一全畫面遊戲殼層
  - 保留既有遊戲系統與資料流
  - 將主要功能改為浮動面板開啟
  - 降低從網頁感到遊戲感的落差
- Non-Goals:
  - 不重寫戰鬥引擎
  - 不重做地圖資料
  - 不在本次加入新的遊戲內容

## Decisions
- Decision: 使用 `Adventure` 作為主場景常駐畫面
  - Why: 現有場景、戰鬥、地圖互動最接近遊戲主畫面，重用成本最低
- Decision: 使用單一 `GameShell` 管理 HUD、快捷列與面板狀態
  - Why: 可以避免再回到多頁 tab 導航
- Decision: 功能面板先重用既有 page 元件內容
  - Why: 先完成互動模型切換，再視需要做第二輪視覺精修
- Decision: 透過新面板容器取代舊 Sidebar，而不是漸進保留雙導航
  - Why: 同時保留兩套導航只會增加複雜度與衝突

## Risks / Trade-offs
- `Adventure` 本身已有大量 overlay，與新的 HUD / 面板可能互相遮擋
  - Mitigation: 統一 z-index 規則，主場景不再依賴舊 header 空間
- 舊 page 元件原本以整頁版型設計，嵌入面板後可能顯得過於「網頁」
  - Mitigation: 先以面板容器吸收版型差異，後續再局部調整 page 內容
- 若直接保留完整 `Dashboard` 作為面板，資訊密度仍偏高
  - Mitigation: 本輪先完成功能遷移，之後第二輪再拆成更遊戲化的角色面板與日誌面板

## Migration Plan
1. 新增 `GameShell`、HUD、Floating Dock、Panel 容器
2. 調整 `App.tsx` 改由 `GameShell` 接管初始化後的主畫面
3. 移除 Sidebar 依賴
4. 調整 `Adventure` 成為真正全畫面場景
5. 將 `Dashboard`、`Inventory`、`Workshop`、`Compendium` 掛入面板
6. 驗證 typecheck / tests / build

## Open Questions
- 後續是否要把 `Dashboard` 拆成更精簡的「角色面板」與「修煉行動面板」
- 是否要將世界地圖快捷鍵也提升到全域 HUD，而不是只保留在 `Adventure` 右上角
