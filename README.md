<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 塵寰仙途

純前端修仙放置 RPG，使用 `Vite + React + TypeScript + Redux Toolkit` 建構，資料儲存在瀏覽器 `localStorage`。

## 目前正式狀態

本專案目前已不是早期的純頁面切換與戰報結算版本，而是：

- 地圖內直接移動、鎖定目標與即時出手
- `runAutoBattle()` 保留作為時間軸數值驗證內核
- 世界戰鬥、時間軸戰鬥與 HUD 已開始共用 cooldown / status / passive flags resolver
- 戰鬥開場敘事也已開始共用 opener helper，元素克制、弱點洞察、護體展開與高境界開場壓制不再散寫
- 技能改為透過技能書學習，不再隨職業 / 突破自動送
- 技能池已切成 `formal core / retired` 視角，retired 進一步收斂為 `battle-absorbed / retirement-ready`
- 高境界精英 / Boss、裝備 audit、技能效果與世界戰鬥 AOE 都已接入第一版正式實作
- 角色屬性、商店、圖鑑與多個操作提示，已開始共用 `GameTooltip / GameHintBubble` 遊戲化外觀元件
- 共用 `Modal` 也已開始向 `GamePanel` 的遊戲化框體語言收斂，任務、商店、背包確認與地圖總覽視窗不再維持舊樣式殼層
- `言出法隨`、`劍道獨尊`、`向死而生` 等高境界被動，已開始同步對齊 world strike 與時間軸戰鬥結果

## 文件入口

- 規格總索引：[docs/index.md](./docs/index.md)
- 平衡審計總覽：[docs/06_Balance_Audit/README.md](./docs/06_Balance_Audit/README.md)
- 即時戰鬥說明：[docs/02_Gameplay/combat.md](./docs/02_Gameplay/combat.md)
- 背包與技能書：[docs/02_Gameplay/inventory.md](./docs/02_Gameplay/inventory.md)

## Run Locally

**Prerequisites:** Node.js 20+


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Build the app:
   `npm run build`
4. Run type checks:
   `npm run typecheck`
5. Run tests:
   `npm run test`
