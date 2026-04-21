## Context

目前 live combat 已正式具備：

- 同場景戰鬥 HUD
- 玩家 / 目標血條、最近戰況、技能 CD、敵方意圖
- 投射物、危險圈、命中特效
- 近戰追擊、遠程風箏、Boss 技能圈與投射物飛行時間

但還有兩個明顯缺口：

1. 怪物分工仍偏「大類型差異」，還不夠支撐更精細的壓迫感與危險辨識
2. 控制與狀態雖然已在 battle core 落地，但 live-combat 視覺層仍缺少足夠直接的 icon / cue / immunity feedback

## Goals

- 讓不同怪物 archetype 在地圖內表現出更明確的站位與出手風格
- 讓玩家能在地圖戰鬥中快速看懂：當前被什麼狀態影響、哪個控制成功 / 被免疫、哪個敵人正在蓄力
- 所有狀態提示都沿用 battle core 已有語意，不新增與 core 脫節的頁面私有規則

## Non-Goals

- 不在這次變更中重寫 battle core 傷害公式
- 不直接開 3D prototype
- 不大改整個 Adventure page 版型

## Decisions

- 以現有 `PixiJS + visualEffects + worldCombatPresentation` 路徑擴充，不新增第二套戰鬥呈現管線
- 怪物分工優先沿既有 `aiStyle / attackRange / specialAttack` 與 world combat helper 延伸，而不是另開完全不同的 AI 系統
- 狀態提示以「小型 icon + 文字 cue + 危險區顏色層級」三層組合實作，而不是只靠日誌文字
- control / immunity / delayed-special 等結果必須由 battle core outcome 或 presentation helper 導出，不在 React component 內手判

## Risks / Trade-offs

- HUD 與場上提示如果加太多，會壓縮地圖可視空間
  - Mitigation: 優先做 target-focused 與 nearby-focused 提示，不把所有怪的狀態都鋪滿
- 怪物分工做太細可能讓數值與表現耦合
  - Mitigation: 先把行為分工限制在站位 / 預警 / 出手節奏，不動 core 乘區

## Migration Plan

1. 先補 live-combat archetype / status presentation helper 與測試
2. 再把 Adventure HUD / Stage cue 接上新資料
3. 最後同步文件與驗證，確認這條主線和 3D prototype 明確分離
