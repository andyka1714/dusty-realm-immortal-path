# 塵寰仙途 (Dusty Realm) - 遊戲規格文檔索引

本專案採用模組化結構管理規格文檔。請透過以下連結閱讀各模組細節。

## 📖 目錄 (Table of Contents)

### [01_Core] 核心機制與數值
定義遊戲最基礎的運作規則與數據結構。
- [attributes.md](01_Core/attributes.md): 角色屬性定義、生成規則 (10-20範圍) 與靈根加成。
- [formulas.md](01_Core/formulas.md): 數值計算公式 (修煉速率、傷害計算、突破機率)。
- [persistence.md](01_Core/persistence.md): 存檔結構 (Redux State) 與離線計算邏輯。

### [02_Gameplay] 遊玩系統
具體的遊戲功能模組。
- [cultivation.md](02_Gameplay/cultivation.md): 修煉、閉關、境界突破流程，以及高境界修為乘區 / 追趕規格入口。
- [combat.md](02_Gameplay/combat.md): 地圖內直接出手、世界戰鬥第一版多目標 AOE、時間軸驗證內核、怪物特招、技能專屬效果、world strike result helper 與共用 battle resolver。
- [inventory.md](02_Gameplay/inventory.md): 背包管理、裝備限制、技能書學習、formal core 技能池與退場技能映射規則。
- [workshop.md](02_Gameplay/workshop.md): 洞府功能 (聚靈陣、煉丹、煉器)。

### [03_World] 世界觀與內容
遊戲內容數據與設定。
- [maps.md](03_World/maps.md): 世界地圖架構、區塊設計、內容密度與高境界單線區說明。
- [bestiary.md](03_World/bestiary.md): 怪物圖鑑、屬性設定、主題化精英 / Boss 與高境界正式狀態。
- [story.md](03_World/story.md): 劇情文本、序幕流程與對話腳本。

### [04_UI] 介面與流程
使用者體驗與介面規範。
- [flow.md](04_UI/flow.md): 遊戲初始化流程 (序幕->抽卡->主頁) 與導航結構。
- [components.md](04_UI/components.md): UI 組件庫規範 (Tailwind 配色、按鈕樣式)。
  - 補充：角色屬性、商店、圖鑑、區域地圖情報、任務獎勵、底部 dock、道途頁資訊與多個操作提示，已開始共用 `GameTooltip / GameHintBubble` 遊戲化外觀；`GamePanel / Modal / GameTooltip` 的標題層已開始共用 `GameTitleStack`，裝飾框體則已開始共用 `GameOrnamentFrame`。
  - 補充：`StatsPanel / ShopPanel / Inventory / Dashboard / QuestModal` 內部的主要資訊區，也已開始共用 `GameSection`，面板內層不再只是零散的 border box。
  - 補充：`World / UI / Audit` 對於地圖情報 tooltip、短提示 eyebrow 與 battle shared resolver 的說法，已開始回到同一套正式描述。

### [05_Data] 數據表 (Data Tables)
純數據參考表，供查閱使用。
- [exp_tables.md](05_Data/exp_tables.md): 各境界修為上限表。
- [item_list.md](05_Data/item_list.md): 物品 ID 與屬性總表。
- [spirit_roots.md](05_Data/spirit_roots.md): 靈根類型與加成係數表。

### [06_Balance_Audit] 數值平衡審計
本輪針對實作數值做的審計文件，重點在於比對文件與程式、驗算修為曲線、戰鬥曲線、裝備與技能落地狀態。
- [README.md](06_Balance_Audit/README.md): 審計總覽與正式來源索引，集中指向各審計文件與程式 registry，避免 README 本身再重複攤開長篇狀態清單。
- [01_修為與境界曲線審計.md](06_Balance_Audit/01_修為與境界曲線審計.md): 修為需求、通道效率、時長試算，以及後期乘區 / 追趕機制正式表。
- [02_戰鬥與裝備曲線審計.md](06_Balance_Audit/02_戰鬥與裝備曲線審計.md): 怪物、裝備、掉落、戰鬥實作審計與每境界 TTK 目標表。
- [03_職業與技能審計.md](06_Balance_Audit/03_職業與技能審計.md): 三職業、技能資料與實戰接線現況。
- [04_平衡目標與改版建議.md](06_Balance_Audit/04_平衡目標與改版建議.md): 建議的目標挑戰帶與改版優先順序。
- [05_經驗明細表.md](06_Balance_Audit/05_經驗明細表.md): 各大境界小境界需求表。
- [06_實作修正落點.md](06_Balance_Audit/06_實作修正落點.md): 這一輪已改哪些檔案、後續要從哪裡繼續改。
- [07_路線分流與主題掉落設計.md](06_Balance_Audit/07_路線分流與主題掉落設計.md): 三路分流、聚合期與職業主題掉落設計整理。
- [08_技能系統與技能書規劃.md](06_Balance_Audit/08_技能系統與技能書規劃.md): 技能改成技能書取得的整理與落地方案。
- [09_即時戰鬥改造分析.md](06_Balance_Audit/09_即時戰鬥改造分析.md): 從戰報回放轉成即時碰撞戰鬥的架構分析，以及 cooldown / opener / passive-proc / defensive-passive / world-strike result / status logger 等 shared resolver 的收斂進度。
- [10_技能數量與功能分類收斂.md](06_Balance_Audit/10_技能數量與功能分類收斂.md): 技能數量控制、功能分類與主流遊戲對照分析。
- [11_三職業核心技能池草案.md](06_Balance_Audit/11_三職業核心技能池草案.md): 劍修、體修、法修的核心技能池草案，以及 retired 技能收斂到 `battle-absorbed / retirement-ready` 的正式規則，並持續對齊 world strike / timeline combat。
- 補充：formal realm view 現在已透過單一 retired-alias 剝離 helper 移除 `retirement-ready active + battle-absorbed passive`，realm dataset 更接近正式技能池視角；formal core 被動的 stat bonus、retirement-ready passive 視圖與 battle-absorbed active 視圖，也已改成直接由 alias-layer 聚合表對照，舊技能則仍保留中央 alias / 相容查詢層。
- [12_技能書實作收斂.md](06_Balance_Audit/12_技能書實作收斂.md): 技能書正式實作、來源規則、前置條件與與程式對齊結果。
- [13_3D渲染與戰鬥呈現評估.md](06_Balance_Audit/13_3D渲染與戰鬥呈現評估.md): 3D、Three.js 與目前 Pixi 戰鬥呈現層的可行性評估。
- [14_整體改造Checklist.md](06_Balance_Audit/14_整體改造Checklist.md): 本輪所有已完成 / 未完成細項的逐條追蹤表。
