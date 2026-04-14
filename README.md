<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 塵寰仙途

純前端修仙放置 RPG，使用 `Vite + React + TypeScript + Redux Toolkit` 建構，資料儲存在瀏覽器 `localStorage`。

## 目前正式狀態

本專案目前已不是早期的純頁面切換與戰報結算版本，而是：

- 地圖戰鬥已成主路徑：玩家可在地圖內直接移動、鎖定目標、普攻與施放主動術式；投射物、AOE、浮字與掉落都直接在場景內完成。
- `runAutoBattle()` 目前保留作為時間軸數值驗證內核；世界戰鬥、時間軸戰鬥與 HUD 已開始共用 cooldown、status、passive flags、部分 incoming-status resolver，以及 world strike runtime / queue / execute / replay helper。
- `Adventure` 內 player / enemy world strike 的 preview、queue、execute、resolution、visual dispatch，以及舊戰報 replay 的 step、context、visual plan，現在都已開始走共用 helper，不再各自維護兩套近似流程。
- 技能改為透過技能書學習，不再隨職業 / 突破自動送；技能池已收斂為 `formal core / retired` 視角，retired skill 只保留中央 alias / 相容查詢層。
- 正式 realm 技能視圖目前已鎖定為 `core only`，並由 `CORE_SKILL_SETS_BY_REALM` 作為正式 export；retired alias 的 realm 聚合、record 合併與正式視圖組裝，都已收斂到 alias-layer / skill index 的共用 util。
- 所有 passive 現在都已改成逐招專屬效果，`passiveEffectTags` 欄位也已自技能資料層完全移除；高境界與 retired passive alias 也不再依賴 generic fallback。
- `化神 -> 仙帝` 的後期修為乘區、高境界追趕機制，以及 `凡人 -> 仙帝` 的三職業 TTK 目標表，已正式落到 progression registry 與測試。
- UI 殼層已開始統一：`GamePanel / Modal / GameTooltip / GameHintBubble / GameSection` 正在收斂成同一套遊戲化語言；主要面板、tooltip、hint bubble 與工坊卡片都已開始套用同一套 section chrome。
- `Gameplay / World / UI / Audit` 文件已完成主要交叉校對；目前剩餘缺口已集中在 battle 單一引擎收口、技能池最終裁剪與少量 UI 尾端一致性。

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
