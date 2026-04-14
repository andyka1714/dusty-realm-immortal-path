<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 塵寰仙途

純前端修仙放置 RPG，使用 `Vite + React + TypeScript + Redux Toolkit` 建構，資料儲存在瀏覽器 `localStorage`。

## 目前正式狀態

本專案目前已不是早期的純頁面切換與戰報結算版本，而是：

- 地圖戰鬥已成主路徑：玩家可在地圖內直接移動、鎖定目標、普攻與施放主動術式；投射物、AOE、浮字與掉落都直接在場景內完成。
- `runAutoBattle()` 目前保留作為時間軸數值驗證內核；世界戰鬥、時間軸戰鬥與 HUD 已開始共用 cooldown、status、passive flags 與部分 incoming-status resolver。
- 戰鬥內核已開始收斂成共用 helper：開場敘事、被動觸發、主動術式施加狀態、防禦型被動、致命保命與 enemy special 抗性，都不再完全散寫在 `runAutoBattle()` 主流程裡。
- `Adventure` 內 player / enemy world strike 的 preview 與延遲執行排程，也已開始共用 helper，地圖即時戰鬥不再各自維護 readyAt / 狀態 / 戰鬥訊息更新。
- `Adventure` 內 player / enemy world strike 的投射物、範圍、命中特效與承傷浮字，也已開始共用 helper，地圖即時戰鬥的視覺與傷害結算流程不再各寫一套。
- 舊戰報 replay 的 projectile / area / impact / text 派發，也已開始回收使用同一套 world strike 視覺 helper，不再額外維護第二套效果派發流程。
- 舊戰報 replay 的逐步播片與 replay context，現在也已開始共用 `processBattleReplayStep(...) / scheduleBattleReplayStep(...) / createBattleReplayContext(...)`，回放 effect 不再直接鋪開 target、skill 與視覺派發整段流程。
- `Adventure` 內 player / enemy world strike 的實際執行鏈，也已開始抽成 `executePlayerWorldStrike(...) / executeEnemyWorldStrike(...)`，玩家與怪物分支不再各自攤開整段命中後流程。
- `Adventure` 內 player / enemy world strike 的 queue orchestration，也已開始抽成 `queuePlayerWorldStrike(...) / queueEnemyWorldStrike(...)`，player / enemy 分支不再各自串接 cast / preview / execute 流程。
- `Adventure` 內 player / enemy world strike 的 action plan 也已開始抽成 `createPlayerWorldStrikePlan(...) / createEnemyWorldStrikePlan(...)`，queue helper 不再各自臨時拼接 cast、preview 與 execute 閉包。
- world strike 結果組裝也已開始拆成 player / enemy 專用 helper，timing 與 area metadata 不再長期散寫在 strike resolver 內。
- retired active / passive alias 的總表合併，現在也已開始共用 `mergeRetiredAliasRecords(...)`，alias-layer 不再各自手寫 `Object.assign(...Object.values(...))` 樣板。
- 靈化期核心被動 `劍意化形 / 肉身成聖 / 道法自然` 也已補進 timeline combat 開場待命訊息；其中 `道法自然` 也已開始在 player world strike 顯式回報。
- 技能改為透過技能書學習，不再隨職業 / 突破自動送；技能池也已切成 `formal core / retired` 視角，retired 進一步收斂為 `battle-absorbed / retirement-ready`。
- 正式 realm 技能視圖目前也已鎖定為 `core only`，retired skill 只保留中央 alias / 相容查詢層。
- realm dataset 現在不再注入 retired alias 後再剝離，而是直接以正式 core skill set 組裝；`CORE_SKILL_SETS_BY_REALM` 也已成為正式 export，retired alias 僅保留在 alias-layer 與中央 lookup。
- formal core 被動的基礎屬性收益，現在也已改成逐招明確對照表；absorbed retired passive 會透過同一份 formal 對照承接，不再靠職業 / 境界通用公式補值。
- retired passive alias 現在也已跟著 explicit passive 視角退出 generic `passiveEffectTags` fallback，資料層不再把舊被動誤導成仍主要依賴通用模板。
- `battle-absorbed / retirement-ready` 的 retired skill 視圖組裝，現在也已開始共用 `buildSkillViewSet(...) / buildRetiredAliasViewSet(...)`，skill index 與 alias-layer 不再各自維護近似 map/view 樣板。
- 多個高境界被動已補齊 world strike / enemy world strike / enemy special world strike 對齊，避免只有時間軸戰鬥才看得到實際效果。
- 所有 passive 現在都已改成逐招專屬效果，`passiveEffectTags` 欄位也已自技能資料層完全移除。
- 第一批高境界 retired active alias 也已補上明確 realtime metadata，避免範圍、目標數與施法節奏持續依賴 default fallback。
- `化神 -> 仙帝` 的後期修為乘區、高境界追趕機制，以及 `凡人 -> 仙帝` 的三職業 TTK 目標表，也已正式收進 progression registry 與測試，不再只停在 balance audit 文件。
- UI 殼層已開始統一：`GamePanel / Modal / GameTooltip / GameHintBubble` 正在收斂成同一套遊戲化語言，`GamePanel / Modal / GameTooltip` 的標題層也已開始共用 `GameTitleStack`。
- `GamePanel / Modal / GameTooltip` 的角飾、內框、頂部光帶與背景光暈，也已開始收斂到共用 `GameOrnamentFrame`，不再各自維護一份近似裝飾層。
- 區域地圖情報、圖鑑掉落來源、任務獎勵、背包 hover、dock 提示、道途資訊與工坊操作等浮層，已開始共用同一套 tooltip / hint 元件。
- `Gameplay / World / UI / Audit` 文件已持續按 battle shared resolver、地圖情報 tooltip 與短提示語言做交叉校對，剩餘缺口集中在最後一輪全面去重。

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
