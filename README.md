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
- `enemy world strike` 的 incoming status 過濾，也已開始和 timeline combat 對齊，DOT / 負面狀態免疫不再只在時間軸戰鬥裡生效
- 戰鬥開場敘事也已開始共用 opener helper，元素克制、弱點洞察、護體展開與高境界開場壓制不再散寫
- 主動術式後的一批被動觸發訊息，也已開始收斂成共用 passive-proc helper，減少 `runAutoBattle()` 戰鬥事件散寫
- 來襲傷害的防禦型被動事件，也已開始收斂成共用 defensive-passive helper，讓 `蠻荒血脈`、`銅皮鐵骨`、`金剛法相`、`肉身成聖`、`元素護盾` 不再分散處理
- 技能改為透過技能書學習，不再隨職業 / 突破自動送
- 技能池已切成 `formal core / retired` 視角，retired 進一步收斂為 `battle-absorbed / retirement-ready`
- 高境界精英 / Boss、裝備 audit、技能效果與世界戰鬥 AOE 都已接入第一版正式實作
- 角色屬性、商店、圖鑑與多個操作提示，已開始共用 `GameTooltip / GameHintBubble` 遊戲化外觀元件
- 區域地圖情報與圖鑑掉落來源浮層，也已開始收進同一套 `GameTooltip` 標題 / 註腳語言
- 底部浮動 dock 的面板切換提示，也已收進同一套 `GameHintBubble` 視覺語言
- 道途頁的人物道號與修煉效率說明，也已收進同一套 `GameTooltip` 外觀，不再維持舊的手寫 hover 面板
- 共用 `Modal` 也已開始向 `GamePanel` 的遊戲化框體語言收斂，任務、商店、背包確認與地圖總覽視窗不再維持舊樣式殼層
- `GamePanel / Modal` 現在都已開始補上 `eyebrow + title + icon` 的正式資訊層級，不再只有單一標題列
- `GameTooltip` 也已開始補齊 `eyebrow + title + body + footer` 結構，核心資訊浮層往同一套語言收口
- `言出法隨`、`劍道獨尊`、`向死而生` 等高境界被動，已開始同步對齊 world strike 與時間軸戰鬥結果
- `法力源泉`、`靈力湧動`、`五氣朝元` 這批法修被動，也已開始補齊 world strike 狀態回報
- `蠻荒血脈`、`銅皮鐵骨`、`金剛法相`、`元素護盾` 這批防禦型被動，也已開始補齊 enemy world strike 狀態回報

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
