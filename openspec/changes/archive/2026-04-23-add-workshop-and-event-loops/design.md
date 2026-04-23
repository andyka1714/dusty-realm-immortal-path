## Context

目前產品已具備：

1. 正式 current/soul 雙層存檔
2. 本世結算與輪迴重建
3. 地圖內即時戰鬥與後期內容密度

但輪迴之後，玩家的中後期日常仍缺少可反覆投入的支撐性 loop。`Workshop` 現在只有 `聚靈陣` 是真功能；`煉丹`、`煉器` 仍只是視覺佔位。同時，`checkTimeEvents` 目前只負責歲數 warning 與少量 flavor log，還不是正式的 encounter system。

這導致 audit 中寫好的 `洞府 / 丹藥 / 奇遇 / 事件` 乘區沒有對應的玩法承接。

## Goals

- 讓 `Workshop` 成為可長期投入的成長系統，而不是單一卡片
- 讓 `事件 / 奇遇` 成為正式可選擇、可驗證、可路線分流的 loop
- 讓高境界乘區表在實際系統中有對應來源，而不是只存在數值文件

## Non-Goals

- 不在這條變更中全面重做宗門主線內容
- 不在這條變更中切換像素風或其他美術方向
- 不重寫 battle core

## Decisions

- 以 `WorkshopState` 為核心擴充 `煉丹 / 煉器 / 配方 / 配置中的產出加成`，不新建第二套平行 progression slice
- 以 `timeActions` 與新 event data pool 承接 encounter/event，不把奇遇直接塞進地圖 NPC 對話
- 先做「穩定 loop」再做大量內容擴張：第一批先求玩法閉環，再追加更多 recipe 與 event pool
- 高境界的乘區承接，以 `聚靈陣穩定底盤 + 丹藥短期 boost + 奇遇 / 事件額外抬升` 為原則

## Risks / Trade-offs

- 若先塞大量 recipe 與 event，但沒有清楚的 state 與 reward 結構，後面會很難平衡
  - Mitigation: 先固定 state schema、reward channel 與倍率掛點
- 若煉丹 / 煉器只做點擊消耗材料，沒有 build 追求，玩家只會把它視為又一個例行按鈕
  - Mitigation: 第一批就要求 recipe、品質或收益明確接到 cultivation / combat / inventory loop
- 若事件只做 flavor text，無法承接高境界 multiplier
  - Mitigation: event 必須有選項、風險、收益與 route-specific 差異

## Migration Plan

1. 擴充 `WorkshopState` 與 event/encounter state schema
2. 補 `Workshop` 與時間事件的正式 reducer / action / data
3. 再補 UI、測試、文件與倍率驗證
