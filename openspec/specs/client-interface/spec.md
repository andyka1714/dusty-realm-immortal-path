# client-interface Specification

## Purpose
定義目前正式使用的 App 入口分流、全屏輪迴流程、遊戲主介面與地圖內即時戰鬥可讀性，讓不同狀態下的使用體驗維持一致。
## Requirements
### Requirement: 應用程式入口分流 (App Entry Routing)
系統必須 (MUST) 在 active current run 與 full-screen 流程之間切換，而不是只支援單一遊戲 shell。

#### Scenario: 有 active current run
- **WHEN** 玩家已有存活中的 current run
- **THEN** 顯示正式 `GameShell`
- **AND** 側邊欄仍包含 `Dashboard / Adventure / Workshop / Inventory` 等主要模組

#### Scenario: 沒有 active current run
- **WHEN** 玩家尚未入世、已死亡待輪迴，或正在輪迴大殿配置下一世
- **THEN** 顯示對應的 full-screen flow
- **AND** 不得直接進入正式 `GameShell`

### Requirement: 死亡總結與輪迴大殿 (Death Summary & Reincarnation Hall)
系統必須 (MUST) 提供正式的死亡總結與輪迴配置介面，承接本世結算與下一世建立。

#### Scenario: 本世結算
- **WHEN** 玩家本世結束
- **THEN** 顯示死因、享年、最高境界、本世功德與 Lifetime Stats 摘要
- **AND** 提供進入輪迴大殿的明確操作入口

#### Scenario: 輪迴大殿配置
- **WHEN** 玩家位於輪迴大殿
- **THEN** 顯示可用功德、魂印選項、遺珍選擇、靈根改寫與 rebirth 預覽
- **AND** 若配置超出功德或遺珍限制，介面必須阻止確認

#### Scenario: 完成投胎
- **WHEN** 玩家確認下一世配置
- **THEN** full-screen flow 必須離開輪迴大殿並進入新的 current run
- **AND** 顯示的新角色狀態必須反映已購買的輪迴加成

### Requirement: 冒險場景與即時戰鬥 HUD (Adventure Scene & Live Combat HUD)
系統必須 (MUST) 在 `Adventure` 場景中提供可讀的同場戰鬥資訊，而不是要求玩家切回舊式大型 modal 閱讀。

#### Scenario: 同場戰鬥 HUD
- **WHEN** 玩家在地圖內與怪物進入戰鬥狀態
- **THEN** 介面必須顯示玩家與目標的血條資訊、技能冷卻與最近戰況 cue
- **AND** 命中、掉血、危險區與特招前饋必須能直接在場景上辨識

#### Scenario: 怪物分工視覺差異
- **WHEN** 近戰、遠程、法術或 Boss 敵人進入同場戰鬥
- **THEN** 介面必須以危險圈、投射物、蓄力 aura、退距帶或 focus reticle 呈現其差異
- **AND** 不得把所有怪物做成相同的視覺節奏

### Requirement: 響應式佈局與視覺語言 (Responsive Layout & Visual Language)
系統必須 (MUST) 維持深色主題、五行語意與桌面 / 行動裝置可用性。

#### Scenario: 桌面與行動版
- **WHEN** 在不同尺寸螢幕瀏覽
- **THEN** 側邊欄、內容區與全屏流程必須維持可操作性與可讀性
- **AND** 行動版不得因 full-screen flow 或 GameShell 切換而破版

#### Scenario: 五行與靈根語意
- **WHEN** 介面顯示靈根、元素、危險提示或關鍵狀態
- **THEN** 必須沿用既有五行色彩與靈根 glow 語意
- **AND** 不得在不同畫面使用互相衝突的語意映射

### Requirement: 洞府百業正式操作介面
系統必須 (MUST) 在 `Workshop` 介面提供正式可操作的聚靈、煉丹與煉器流程，而不是只顯示未開放遮罩。

#### Scenario: 煉丹與煉器可以操作
- **WHEN** 玩家進入 `Workshop`
- **THEN** 介面必須顯示可用 recipe、材料需求、預期產出與操作入口
- **AND** 不得再以 placeholder 卡片代替正式 loop

#### Scenario: 洞府收益可讀
- **WHEN** 玩家升級聚靈陣、煉製丹藥或完成煉器
- **THEN** 介面必須清楚顯示資源消耗與實際收益
- **AND** 玩家不必離開 `Workshop` 才能理解本次投入的結果

### Requirement: 事件與奇遇的正式呈現
系統必須 (MUST) 為 event / encounter 提供正式的選項與結果 UI，而不是只寫入日誌。

#### Scenario: event 選項畫面
- **WHEN** 觸發事件或奇遇
- **THEN** 介面必須顯示事件描述、可選操作與對應風險 / 收益提示
- **AND** 玩家必須能明確完成一次選擇，而不是只旁觀 flavor log

### Requirement: 像素風視覺基線與垂直切片
系統必須 (MUST) 在全面切換像素風前，先建立正式的像素風 art bible 與可操作的 representative vertical slice。

#### Scenario: 像素風 art bible 可供執行
- **WHEN** 團隊決定評估像素風方向
- **THEN** 必須有一份正式文件定義 tile、sprite、UI、VFX、palette、scale 與 HUD 疊層規格
- **AND** 文件必須同時包含 web / mobile 的顯示策略，而不是只描述桌機畫面

#### Scenario: 像素風垂直切片可操作
- **WHEN** 玩家進入指定的 prototype 場景
- **THEN** 介面必須以同一套像素語言渲染地圖、玩家、怪物、傳送門與 HUD
- **AND** 不得只提供靜態 mockup 或單張截圖

#### Scenario: 行動裝置像素縮放保持清晰
- **WHEN** prototype 場景在行動裝置尺寸運行
- **THEN** 必須維持整數倍縮放與可讀的 HUD
- **AND** 不得因平滑縮放或版面擁擠而讓畫面變糊或資訊不可讀

### Requirement: 事件內容提示延續既有可讀性
介面必須 (MUST) 讓新增 encounter 內容沿用現有 pending panel 的路線、類型、風險與收益提示，不得新增只能靠長文字猜測的事件。

#### Scenario: 新事件顯示路線與收益 cue
- **WHEN** 新增 encounter 進入 pending panel
- **THEN** 介面必須能顯示該事件的 category、route 或 choice cue
- **AND** 玩家必須能在選擇前理解該事件偏向穩定收益、材料來源、宗門路線或高風險獎勵

### Requirement: 後段宗門與世界內容可發現性
介面必須 (MUST) 讓玩家能透過既有宗門 NPC、任務 modal 或 pending encounter 看見後段宗門與世界內容。

#### Scenario: 宗門 NPC 提供後段任務入口
- **WHEN** 玩家回到所屬宗門 hub 且符合後段任務前置條件
- **THEN** 對應 NPC 必須能提供後段任務入口
- **AND** 任務 dialogue 必須說明要前往的後段世界目標

#### Scenario: 後段 world encounter 顯示路線 cue
- **WHEN** 後段宗門或世界 encounter 進入 pending modal
- **THEN** modal 必須顯示事件類型、route label 與選項風險 / 收益 cue
- **AND** 不得要求玩家從純文字描述猜測該事件屬於哪條路線

### Requirement: 後段世界章節可發現性
介面必須 (MUST) 讓玩家能透過既有 NPC、Quest modal 或 pending encounter 看見後段世界章節入口。

#### Scenario: 後段 NPC 或事件提供章節 cue
- **WHEN** 玩家符合後段世界章節條件
- **THEN** 介面必須能顯示對應任務、NPC 對話或 encounter cue
- **AND** 玩家不得只能靠文件或地圖名稱猜測下一步

### Requirement: Workshop 專精與材料來源可讀性
Workshop 介面必須 (MUST) 讓玩家看懂專精解鎖條件、目前可否切換與高階材料來源。

#### Scenario: 顯示專精鎖定與切換資訊
- **WHEN** 玩家進入 Workshop 並查看 `Alchemy / Smithing` 專精
- **THEN** 介面必須顯示目前專精、可選專精、鎖定原因與切換成本
- **AND** 不得只顯示一個無條件可點擊的效果名稱

#### Scenario: 顯示高階材料來源 cue
- **WHEN** 玩家查看高階 recipe 或 route-specific material requirement
- **THEN** 介面必須提供來源、route 或 encounter cue
- **AND** 玩家必須能判斷該材料與哪條世界 / 宗門 / 奇遇路線相關

#### Scenario: v3 route source 顯示於 Workshop recipe 與專精 cue
- **WHEN** 玩家查看承接 `sect:*:world-chapter-03` 的 high-tier recipe 或 specialization leaf
- **THEN** Workshop UI 必須顯示 route tag、v3 route source、world chapter cue 與 specialization effect cue
- **AND** 若玩家尚未具備對應 route memory 或材料，介面必須顯示可理解的缺口原因

### Requirement: GameShell 內正式功能入口
系統必須 (MUST) 在正式 `GameShell` 內承接目前已落地的主要功能面板，而不是只保留單一 `Adventure` 畫面。

#### Scenario: Dock panel 切換正式面板
- **WHEN** 玩家位於有 active current run 的正式 `GameShell`
- **THEN** 系統必須允許從 dock 或等效入口切換 `Dashboard`、`Inventory`、`Workshop` 與 `Compendium`
- **AND** 各面板必須以 overlay panel 或等效承接方式顯示，而不離開主場景 shell

### Requirement: 圖鑑分類與瀏覽可讀性
介面必須 (MUST) 讓 `萬界圖鑑` 的物品、功法與宗門資料以可掃描的分類方式呈現，而不是只把所有資料平鋪在同一個長頁中。

#### Scenario: 神兵法寶標題不得遮住物品卡
- **WHEN** 玩家在 desktop 或 mobile viewport 開啟 `神兵法寶`
- **THEN** 境界或分類標題不得覆蓋第一排物品卡片
- **AND** 玩家必須能在不猜測 scroll offset 的情況下讀到每個 section 的第一個物品

#### Scenario: 功法神通按職業與境界瀏覽
- **WHEN** 玩家開啟 `功法神通`
- **THEN** 介面必須提供 `通用 / 劍修 / 體修 / 法修` 或等效 profession filter
- **AND** 每個 profession view 必須能按境界分組或過濾
- **AND** 不得只用全量卡片平鋪要求玩家逐張辨識職業與境界

#### Scenario: 宗門傳承以單宗聚焦瀏覽
- **WHEN** 玩家開啟 `宗門傳承`
- **THEN** 介面必須讓玩家切換 `凌霄劍宗 / 萬獸山莊 / 縹緲仙宮` 或等效 sect filter
- **AND** 同一時間應聚焦顯示單一宗門的人物、傳承功法與章節線索
- **AND** mobile viewport 不得因三宗內容一次展開而造成難以掃描的超長頁

### Requirement: Pending encounter 正式承接
系統必須 (MUST) 在 yearly event 觸發遭遇時，以正式 modal / panel 流程承接選項與結果。

#### Scenario: 遭遇事件浮現
- **WHEN** 玩家處於正式遊玩流程且產生 pending encounter
- **THEN** `GameShell` 必須顯示對應的 encounter panel 或 modal
- **AND** 面板必須顯示事件標題、描述、年份與可選分支

#### Scenario: 遭遇選項完成
- **WHEN** 玩家在 pending encounter 中選擇某個 choice
- **THEN** 介面必須將選擇結果交回正式 state flow 處理
- **AND** 成功處理後不得留下過期的 pending encounter UI

### Requirement: 正式 Adventure terrain/background 像素化整合
系統必須 (MUST) 允許正式 `AdventureStage` 以像素化 terrain / background layer 呈現地圖主題，同時保留既有角色與戰鬥可讀性。

#### Scenario: 正式 Adventure 背景使用像素 terrain
- **WHEN** 玩家進入正式 `AdventureStage`
- **THEN** 系統必須顯示與 `mapData.theme` 對應的像素 terrain / background layer
- **AND** 不得只剩純黑底與單層格線作為唯一背景語言

#### Scenario: 正式 Adventure entity 表現維持現狀
- **WHEN** 正式 `AdventureStage` 套用像素 terrain 背景
- **THEN** 玩家、NPC、怪物、portal 與既有文字 avatar 必須維持現狀
- **AND** 不得把 prototype test page 的 entity token 直接推進到主流程

#### Scenario: 戰鬥 cue 在新背景上仍然可讀
- **WHEN** target marker、危險圈、投射物、狀態 cue 或其他 combat overlay 出現在像素 terrain 背景上
- **THEN** 它們必須保持清楚可辨
- **AND** 桌面與行動版都不得因背景整合而明顯降低可讀性

### Requirement: 事件選項必須讓玩家可讀地判斷風險與收益
系統必須 (MUST) 在 pending encounter 介面中，讓玩家在選擇前看懂事件類型、收益方向與代價差異，而不是只能閱讀一段抽象敘述。

#### Scenario: 面板顯示事件上下文
- **WHEN** `PendingEncounterPanel` 顯示正式 encounter
- **THEN** 介面必須呈現事件的類型、年份或其他關鍵上下文 cue
- **AND** 若事件屬於 profession、sect 或 route-specific pool，介面必須提供對應辨識資訊

#### Scenario: choice 顯示風險收益 cue
- **WHEN** 玩家檢視 encounter 的不同選項
- **THEN** 每個選項都必須提供足以判讀風險、成本或收益方向的 cue
- **AND** 不得讓玩家只能靠猜測理解哪個選項較穩健、較昂貴或較高風險

#### Scenario: v3 終盤事件顯示路線與收益 cue
- **WHEN** `expand-encounter-content-density-v3` 新增的終盤 encounter 進入 pending panel
- **THEN** 介面必須顯示該事件的 category、route、profession 或 choice cue
- **AND** 玩家必須能在選擇前理解該事件偏向穩定收益、材料來源、宗門路線或高風險獎勵

#### Scenario: v3 aftermath 顯示路線與收益 cue
- **WHEN** v3 aftermath encounter 進入 pending panel
- **THEN** 介面必須顯示 routeLabel、categoryLabel、chainLabel、memoryCue 與 choice cue tags
- **AND** 玩家必須能在選擇前辨識穩定收益、材料來源或高風險收益

#### Scenario: Mobile modal 與地圖畫面維持可用
- **WHEN** 玩家在 mobile viewport 開啟 pending encounter、GameShell panel 或 Adventure map
- **THEN** modal / panel 不得產生水平溢出或不可達內容
- **AND** Adventure 正式 canvas 不得退回全黑畫面

### Requirement: 高階 Workshop 可讀性
系統必須 (MUST) 在 Workshop 介面清楚呈現高階 recipe 的鎖定條件、材料來源、品質預期與專精收益，讓玩家能理解百業深度而不是只看到不可點擊按鈕。

#### Scenario: 高階 recipe card 顯示必要 cue
- **WHEN** 玩家開啟 `洞府百業` 並查看高階煉丹或煉器 recipe
- **THEN** 介面必須顯示 recipe tier、最低境界、材料擁有量、材料來源或 route tags
- **AND** 介面必須顯示產出品質、專精或 mastery cue

#### Scenario: 鎖定原因可被辨識
- **WHEN** 玩家尚未符合高階 recipe 的境界、百業等級或材料要求
- **THEN** 介面必須明確指出主要鎖定原因
- **AND** 不得只用 disabled button 隱藏失敗原因

#### Scenario: 不改動 actor token 表現
- **WHEN** 高階 Workshop UI 更新
- **THEN** 系統不得更改 `AdventureStage` 中玩家、NPC、怪物或角色 token 的文字呈現
- **AND** 像素化仍限定在 terrain / background production track

### Requirement: 即時戰鬥 HUD 與場上提示
系統必須 (MUST) 在 Adventure 的即時戰鬥流程中，提供狀態、控制與怪物分工相關的 HUD 與場上視覺提示。

#### Scenario: 目標 HUD 顯示狀態與控制資訊
- **WHEN** 玩家鎖定目標或正在與目標交戰
- **THEN** HUD 必須顯示該目標的重要狀態、控制結果或相關剩餘資訊
- **AND** 玩家也必須能看見自己當前的重要戰鬥狀態提示

#### Scenario: 場上顯示角色分工相關的危險與射程提示
- **WHEN** 敵人進入接戰、維持距離、蓄力或準備特招
- **THEN** 場景必須顯示相對應的射程圈、危險區、蓄力提示或其他可視 cue
- **AND** 不同類型敵人的提示應具有可辨識差異

#### Scenario: 視覺提示不應破壞主要地圖可視性
- **WHEN** 系統顯示 live-combat icon、文字 cue、危險區與特效
- **THEN** 提示必須優先保持目標可讀與地圖可視性
- **AND** 不得以長期遮蔽整個戰場的方式實作

### Requirement: 像素地圖 production polish
系統必須 (MUST) 讓正式 `AdventureStage` 的 terrain / background 像素語言具備可重複擴量的 biome palette、tile semantic、landmark / POI / path 規格，同時維持玩家、NPC、怪物與角色本體的文字 token 呈現。

#### Scenario: biome 與 tile 語意可追蹤
- **WHEN** 正式地圖依 theme / route 產生 pixel terrain
- **THEN** 系統必須能追蹤主要 tile semantic，例如 ground、path、water、hazard、POI、portal clearing 或 Boss arena
- **AND** 不得只用隨機雜訊或單純 palette replacement 取代地圖語意

#### Scenario: route-specific landmark 可讀
- **WHEN** 玩家進入不同路線或同 theme 的不同代表地圖
- **THEN** 背景層必須提供可辨識的 route-specific skeleton 或 landmark
- **AND** 不得讓 `North / East / West / Spirit / Void / Immortal / Ultimate` 等代表地圖全部退化成相同 floorplan

#### Scenario: actor token 維持文字遊戲感
- **WHEN** terrain / background 進行 pixel polish
- **THEN** 玩家、NPC、怪物、角色本體、portal marker、combat overlay 與 HUD 必須維持正式版既有呈現
- **AND** 不得在這條 change 中把 actor layer 改成 pixel sprite 或 prototype token 牌

#### Scenario: 桌面與手機端維持 budget
- **WHEN** 正式 Adventure 地圖在桌機與手機瀏覽器顯示 pixel terrain
- **THEN** terrain polish 必須維持既有整數倍像素縮放與可讀性
- **AND** 不得讓背景細節壓過戰鬥 cue、target marker 或 HUD

### Requirement: 像素地圖 landmark 與地景骨架
系統必須 (MUST) 讓正式 `AdventureStage` 的 terrain / background 像素語言呈現更清楚的 landmark、route skeleton、path corridor、Boss arena 與 hazard 差異，同時維持 actor token 呈現不變。

#### Scenario: 背景地景具備 route-specific 骨架
- **WHEN** 玩家進入不同 theme 或 route 的正式 Adventure 地圖
- **THEN** terrain / background 必須以 palette、semantic role 或 skeleton motif 顯示可辨識差異
- **AND** 不得讓不同高境界地圖全部退回相同 floorplan 與單一 detail pattern

#### Scenario: Actor token 不被像素化
- **WHEN** terrain landmark polish 套用到正式 AdventureStage
- **THEN** 玩家、怪物、NPC、角色文字 token、HUD 與 combat overlay 必須維持既有呈現
- **AND** 不得在這條 change 中改成 prototype 文字牌或 pixel sprite

### Requirement: 主動坐化輪迴入口
系統必須 (MUST) 提供正式的 `主動坐化` 入口，讓玩家不必等到死亡才可結束本世並規劃下一世。

#### Scenario: 活著時主動進入輪迴流程
- **WHEN** 玩家仍存活且滿足正式門檻，並在 `Dashboard` 或等效正式入口選擇 `主動坐化`
- **THEN** 介面必須進入與死亡相同的 `Life Review -> Reincarnation Hall` 流程
- **AND** 本世結算必須把 `cause` 標記為 `voluntary`

### Requirement: Reincarnation Hall 正式 build planner
系統必須 (MUST) 讓 `Reincarnation Hall` 提供足夠的 planner 資訊，而不是只顯示最小成本摘要。

#### Scenario: 顯示進階 perk 與鎖定條件
- **WHEN** 玩家進入 `Reincarnation Hall`
- **THEN** 介面必須顯示目前可用與未解鎖的 perk 條目
- **AND** 對未解鎖條目必須顯示明確條件，而不是直接消失

#### Scenario: 顯示多格遺珍與起手預覽
- **WHEN** 玩家調整遺珍、魂印與靈根配置
- **THEN** 介面必須同步顯示可用遺珍格數、已選擇遺珍與起手加成預覽
- **AND** 若配置超出合法 slot 或功德預算，介面必須阻止確認

### Requirement: Workshop 專精與 recipe cue
系統必須 (MUST) 在 Workshop UI 呈現 recipe 擴量與專精效果，讓玩家能理解目前專精、熟練度與高階 recipe 受影響的地方。

#### Scenario: 顯示目前專精與可選分支
- **WHEN** 玩家打開 Workshop
- **THEN** 介面必須顯示 `alchemy / smithing` 目前專精或尚未選擇狀態
- **AND** 必須提供可讀的專精效果說明

#### Scenario: recipe card 顯示專精影響
- **WHEN** recipe 受到目前專精影響
- **THEN** recipe card 必須顯示受影響 cue，例如成本、輸出、品質或 mastery 改變
- **AND** 鎖定原因仍必須保留境界、等級、靈石與材料不足訊息

### Requirement: Workshop 專精樹介面
介面必須 (MUST) 在 Workshop 中呈現專精樹節點、鎖定原因、分支衝突、reset 操作與 recipe 受影響 cue。

#### Scenario: 玩家理解專精節點狀態
- **WHEN** 玩家查看煉丹或煉器專精
- **THEN** 介面必須顯示目前已解鎖節點、可解鎖節點、鎖定原因與分支互斥提示
- **AND** 不得只顯示無法操作的單一專精名稱

#### Scenario: 玩家可合法 reset 專精
- **WHEN** 玩家符合 reset 成本並確認 reset
- **THEN** 介面必須能觸發對應 reset action
- **AND** reset 後必須清楚顯示可重新選擇的專精狀態

### Requirement: 事件鏈與世界記憶提示
介面必須 (MUST) 讓玩家在 encounter 選擇前看懂該事件是否延續過去結果，或是否會留下後續記憶。

#### Scenario: Pending encounter 顯示 chain cue
- **WHEN** pending encounter 屬於事件鏈或引用世界記憶
- **THEN** 面板必須顯示可讀的 chain、route 或 consequence cue
- **AND** 不得只顯示內部事件 id 或要求玩家猜測後續影響

### Requirement: 宗門世界章節可發現性 v2
介面必須 (MUST) 讓玩家透過 NPC、Quest modal 或 pending encounter 看見 route chapter 的入口、進度與結果 cue。

#### Scenario: 章節入口顯示下一步
- **WHEN** 玩家符合 route chapter 條件
- **THEN** 介面必須顯示可互動的 NPC、quest 或 encounter 入口
- **AND** 玩家不得只能靠文件推測下一步去哪裡

#### Scenario: v3 後段章節顯示 map-local 入口
- **WHEN** 玩家完成 route chapter v2 並抵達 `劫雲荒原` 或 `接引仙殿`
- **THEN** 對應宗門 NPC、Quest modal 或 pending encounter 必須顯示 v3 章節路線、route label 與結果 cue
- **AND** 玩家不得只能靠地圖名稱猜測 `渡劫 -> 仙人` 的宗門承接

### Requirement: Workshop v2 決策 cue
Workshop 介面必須 (MUST) 顯示 mastery milestone、specialization leaf、route-specific sink 與產出差異，讓玩家能理解中後期製作決策。

#### Scenario: Recipe card 顯示 v2 cue
- **WHEN** 玩家查看 v2 高階 recipe
- **THEN** 介面必須顯示 routeTags、sourceHint、mastery milestone 或 specialization effect cue
- **AND** 不得只用 disabled button 或純文字成本隱藏核心差異

#### Scenario: Recipe card 顯示 v3 route memory cue
- **WHEN** 玩家查看承接三宗 v3 world chapter 的 high-tier recipe
- **THEN** recipe card 必須把人讀 sourceHint 與 machine-readable `sect:*:world-chapter-03` route source 分開呈現
- **AND** route-specific material sink、specialization impact 與鎖定原因仍必須同卡可讀

### Requirement: 輪迴 build preview v2
輪迴大殿介面必須 (MUST) 顯示下一世 build identity、主要限制與預期收益。

#### Scenario: Preview 顯示 build 身分
- **WHEN** 玩家調整 perk、魂印或遺珍配置
- **THEN** 介面必須更新下一世 build cue
- **AND** 若配置非法，必須顯示功德、slot、前置或互斥原因

### Requirement: 補給品購買與使用可讀性
介面必須 (MUST) 讓玩家在商店與背包中看懂補給品的價格、效果、可用狀態與不可用原因。

#### Scenario: 商店顯示補給品效果
- **WHEN** 玩家在 ShopPanel 查看消耗品或補給品
- **THEN** 介面必須顯示價格、庫存限制與主要 effect
- **AND** 不得只顯示名稱讓玩家猜測用途

#### Scenario: 背包使用補給前顯示可用狀態
- **WHEN** 玩家在 Inventory 選中恢復品或補給品
- **THEN** 介面必須顯示該道具目前是否可用
- **AND** 若不可用，必須顯示原因，例如未受傷、沒有可恢復資源、境界不符或效果尚未支援

#### Scenario: 使用後可見資源變化
- **WHEN** 玩家成功使用補給品
- **THEN** 介面必須讓玩家看見對應資源或狀態變化
- **AND** 不得只扣除道具而沒有任何可見回饋

### Requirement: 像素地圖 production v2
系統必須 (MUST) 讓正式 `AdventureStage` 的 terrain/background 擁有可擴充的 biome、special terrain、landmark 與 route skeleton 語言，同時維持 actor token 不變。

#### Scenario: 地圖背景提供更清楚的 production language
- **WHEN** 玩家進入不同 biome 或 route skeleton 的地圖
- **THEN** 背景必須能透過 tile、landmark、special terrain 或 route motif 表現差異
- **AND** 不得退回只有通用方塊與格線

#### Scenario: Actor token 維持文字遊戲表現
- **WHEN** 像素地圖 production v2 套用到正式 Adventure
- **THEN** 玩家、NPC、怪物與角色 token 必須維持既有文字呈現
- **AND** 不得導入 prototype 用 pixel sprite 取代 actor token
