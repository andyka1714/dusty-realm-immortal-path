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
系統必須 (MUST) 維持深色主題、五行語意、shared panel 可讀性與桌面 / 行動裝置可用性。

#### Scenario: 桌面與行動版
- **WHEN** 在不同尺寸螢幕瀏覽
- **THEN** 側邊欄、內容區與全屏流程必須維持可操作性與可讀性
- **AND** 行動版不得因 full-screen flow 或 GameShell 切換而破版

#### Scenario: 五行與靈根語意
- **WHEN** 介面顯示靈根、元素、危險提示或關鍵狀態
- **THEN** 必須沿用既有五行色彩與靈根 glow 語意
- **AND** 不得在不同畫面使用互相衝突的語意映射

#### Scenario: 共享浮層面板不裁切關鍵內容
- **WHEN** 玩家在 shared `GamePanel` 中開啟 `道途 / 行囊 / 洞府 / 萬界圖鑑`
- **THEN** 面板內的主要 action、資訊卡、側欄詳情、分類 tabs 與摘要區不得被父容器裁切
- **AND** 同一列 action 必須使用一致尺寸與排列，不得因額外 wrapper 造成按鈕高度或位置異常
- **AND** 內容需要超出 panel 高度時必須可透過內層或外層 scroll 讀取，而不是被 `overflow-hidden` 靜默截斷

#### Scenario: 共享面板 browser smoke 覆蓋代表性幾何問題
- **WHEN** Playwright smoke 在 desktop 與 mobile viewport 驗證 shared panel
- **THEN** 測試必須覆蓋 horizontal overflow、section overlap、sticky heading 遮擋、action row alignment 與重要內容可見性
- **AND** 測試不得只檢查文字存在，必須至少對近期回歸過的面板加入 bounding box 或 viewport geometry assertion

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
介面必須 (MUST) 讓 `萬界圖鑑` 的物品、功法與宗門資料以可掃描的分類與來源追蹤方式呈現，而不是只把所有資料平鋪在同一個長頁中。

#### Scenario: 境界總覽顯示玩家可讀說明
- **WHEN** 玩家打開 `境界總覽`
- **THEN** 每個境界卡片必須顯示境界名稱、修行定位與短說明
- **AND** 介面不得顯示 internal realm id 作為主要內容

#### Scenario: 功法神通顯示秘卷來源
- **WHEN** 圖鑑顯示正式 core skill
- **THEN** 介面必須能顯示對應 manual source labels
- **AND** 若技能書 route 能推導具體商店、精英、Boss 或傳承殿名稱，介面必須顯示具體來源名稱
- **AND** 不得要求玩家從 internal skill id 或抽象 source tier 推測技能來源

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

#### Scenario: visual QA 摘要可驗證
- **WHEN** 測試或工具檢查代表地圖的 terrain/background
- **THEN** 系統必須輸出或可推導 palette、semantic role、skeleton、motif 與 forbidden actor-token 狀態
- **AND** QA 摘要必須可被 regression 驗證，避免 pixel terrain 退回黑畫面或單一 floorplan

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

#### Scenario: 顯示 v3 route-memory 本命魂印 cue
- **WHEN** 玩家在 `Reincarnation Hall` 查看承接 `sect:*:world-chapter-03` 的高階本命魂印
- **THEN** 可用魂印卡片必須顯示 v3 route memory source、下一世 build identity cue 與預期收益
- **AND** 鎖定魂印卡片必須顯示缺少哪個 `sect:*:world-chapter-03` world memory

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

#### Scenario: Preview 承接 v3 route memory
- **WHEN** 玩家選擇由 `sect:*:world-chapter-03` 解鎖的本命魂印
- **THEN** 輪迴大殿必須顯示該魂印對應的 route identity、遺珍限制與預期收益
- **AND** 介面不得要求玩家從內部 seal id 推測該魂印來自哪條宗門世界記憶

### Requirement: 補給品購買與使用可讀性
介面必須 (MUST) 讓玩家在商店、背包與戰鬥快捷補給中看懂補給品的價格、效果、可用狀態、資源變化與不可用原因。

#### Scenario: 商店顯示補給品效果
- **WHEN** 玩家在 ShopPanel 查看消耗品或補給品
- **THEN** 介面必須顯示價格、庫存限制與主要 effect
- **AND** `heal_hp / heal_mp / full_restore / breakthrough_chance / gain_exp / lifespan / learn_skill` 必須顯示一致且可讀的文案
- **AND** 不得只顯示名稱讓玩家猜測用途

#### Scenario: 背包使用補給前顯示可用狀態
- **WHEN** 玩家在 Inventory 選中恢復品或補給品
- **THEN** 介面必須顯示該道具目前是否可用
- **AND** 若不可用，必須顯示原因，例如未受傷、沒有可恢復資源、境界不符或效果尚未支援
- **AND** 沒有 runtime recovery handler 時，恢復品不得呈現為可成功服用

#### Scenario: 使用後可見資源變化
- **WHEN** 玩家成功使用補給品
- **THEN** 介面必須讓玩家看見對應資源或狀態變化
- **AND** 戰鬥快捷補給與背包 recovery handler 必須讓資源變化和道具扣除保持同一個成功條件
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

### Requirement: 前端 build performance budget
系統必須 (MUST) 讓正式前端 build 具備可追蹤的 chunk budget，避免已知 runtime chunk 造成長期 warning noise。

#### Scenario: Build 不輸出預設 chunk warning
- **WHEN** 開發者執行 `npm run build`
- **THEN** build 必須成功完成且不因既有 Pixi runtime chunk 輸出 Vite 預設 chunk size warning
- **AND** 專案必須保留明確的 chunk budget 設定，讓後續 chunk 成長仍可被 build gate 追蹤

#### Scenario: Preview-only code 不同步載入正式入口
- **WHEN** 玩家以一般遊戲入口載入 app
- **THEN** pixel prototype preview code 必須維持在 query-gated lazy boundary 後
- **AND** 正式 `GameShell`、`Adventure`、`Inventory`、`Workshop`、`Compendium` panels 必須維持原本 lazy loading 行為

### Requirement: 終盤收束與輪迴語意可讀
介面必須 (MUST) 讓玩家分辨死亡後輪迴、主動坐化、本世收束、飛升/結局式收束與主動重開的語意差異，而不是把所有入口都呈現成同一個懲罰式重置。

#### Scenario: 主動收束入口顯示本世語意
- **WHEN** 玩家仍活著並查看 Dashboard 的主動輪迴入口
- **THEN** 介面必須顯示這是主動完成本世並進入下一世規劃
- **AND** 必須避免讓玩家誤解成死亡懲罰或無提示刪檔

#### Scenario: 輪迴大殿顯示 v4 route reward cue
- **WHEN** 玩家在輪迴大殿查看由 v4 endgame memory 解鎖或強化的 route reward
- **THEN** 卡片必須顯示對應 route identity、endgame memory source 與下一世收益
- **AND** locked 狀態必須顯示缺少的 v4 memory tag

#### Scenario: 終盤 Workshop 與 pending encounter 保持 cue 可讀
- **WHEN** 玩家查看 v4 終盤 recipe 或 pending encounter
- **THEN** 介面必須顯示 route label、source hint、memory cue 或材料 sink cue
- **AND** mobile shared panel 不得因新增 cue 產生水平溢出

### Requirement: 終盤路線 v5 提示可讀性
介面必須 (MUST) 讓玩家在 pending encounter、Workshop、地圖 NPC、圖鑑與輪迴大殿中讀懂 v5 route aftermath、終盤材料用途與下一世 build hook。

#### Scenario: v5 pending encounter 顯示 route cue
- **WHEN** v5 aftermath encounter 進入 pending panel
- **THEN** panel 必須顯示 routeLabel、categoryLabel、chainLabel、memoryCue 與 choice cue tags
- **AND** choice cue 必須能分辨穩定收益、材料來源或高風險收益

#### Scenario: v5 Workshop recipe 顯示 source trace
- **WHEN** 玩家查看 v5 endgame follow-up recipe
- **THEN** recipe card 必須顯示人讀 sourceHint、machine-readable `sect:*:endgame-loop-v4` route tag、材料需求與產出

#### Scenario: v5 輪迴魂印顯示 build hook
- **WHEN** 玩家查看 v5 soul seal
- **THEN** available seal 必須顯示 route memory、identity cue、預期收益與 heirloom hint
- **AND** locked seal 必須顯示缺少哪個 `sect:*:endgame-loop-v4`

### Requirement: 妖獸圖鑑必須呈現正式戰鬥情報
介面必須 (MUST) 在萬界圖鑑的 `九域輿圖` 中呈現地圖、NPC、妖獸與掉落資訊，讓玩家能判斷區域威脅與收益，而不是只顯示境界與可能掉落。

#### Scenario: 九域輿圖按境界分組地圖
- **WHEN** 玩家打開 `九域輿圖`
- **THEN** 地圖索引必須按建議境界分組
- **AND** 選取地圖後必須顯示地圖資訊、區域人物、區域妖獸與可能掉落

#### Scenario: 圖鑑妖獸卡顯示戰鬥數值與技能
- **WHEN** 玩家在 `九域輿圖` 查看包含妖獸的地圖
- **THEN** 妖獸卡必須顯示戰力、HP、攻擊、防禦、元素、AI 風格、弱點或抗性
- **AND** 若妖獸有特殊攻擊，必須顯示特殊攻擊名稱與冷卻
- **AND** 若妖獸沒有特殊攻擊，必須明確顯示無特殊攻擊，而不是留空

#### Scenario: 選取目標卡顯示接戰前情報
- **WHEN** 玩家在 Adventure 場景選取妖獸但尚未進入戰鬥結果流程
- **THEN** 目標卡必須顯示妖獸戰力、HP、攻防、元素與特殊攻擊摘要
- **AND** 玩家必須能在接戰前判斷該目標是否高風險

### Requirement: Adventure HUD 必須呈現完整角色狀態
介面必須 (MUST) 在正式 `GameShell` 的 Adventure 畫面左上角顯示可掃描的角色狀態卡，而不是只顯示名稱、境界與資源文字列。

#### Scenario: 左上角色狀態卡顯示 RPG 核心資訊
- **WHEN** 玩家位於正式 Adventure 場景
- **THEN** 左上 HUD 必須顯示暫代 avatar、角色名稱、境界、derived Lv、HP、MP、戰力與目前活動狀態
- **AND** HP / MP 必須由既有角色戰鬥屬性推導
- **AND** 戰力必須沿用正式 combat power helper，而不是另寫一套 UI 估算

### Requirement: 底部 Dock 承接主要單機功能入口
介面必須 (MUST) 讓底部 dock 承接主要功能入口，避免把角色、背包、功法、洞府、圖鑑與地圖入口分散到互相競爭的 HUD 區塊。

#### Scenario: Dock 顯示主要功能入口
- **WHEN** 玩家位於正式 Adventure 場景
- **THEN** dock 必須提供 `道途 / 背包 / 功法 / 洞府 / 圖鑑 / 地圖` 入口
- **AND** `功法` 入口必須能開到已存在的功法資訊面板或圖鑑功法 tab
- **AND** `地圖` 入口必須能開啟 Adventure 地圖 modal 或等效地圖介面

### Requirement: 戰鬥操作不再依賴大型底部快捷列
介面必須 (MUST) 保留場景點擊、普攻、技能、掛機與地圖操作，但不得用大型 `GameSection` 戰鬥快捷列長期佔據底部核心視野。

#### Scenario: 戰鬥 action wheel 保留操作但降低版面佔用
- **WHEN** 地圖狀態需要顯示戰鬥操作
- **THEN** 介面必須以小型 action wheel、icon button 或等效低佔用控制呈現
- **AND** 不得再顯示寬版 `戰鬥快捷列` 面板遮住場景與底部 dock

### Requirement: Adventure 主畫面必須提供任務追蹤 HUD
介面必須 (MUST) 在 Adventure 主畫面提供 derived 任務追蹤欄，讓玩家不需要離開主場景就能讀到目前主要任務進度。

#### Scenario: 顯示 active quest 進度
- **WHEN** 玩家有 active quest
- **THEN** 任務追蹤 HUD 必須顯示任務類型、標題、進度或可回報狀態
- **AND** 任務排序必須優先顯示可回報任務、主線、宗門任務，再顯示其他任務

#### Scenario: 沒有 active quest
- **WHEN** 玩家沒有 active quest
- **THEN** 任務追蹤 HUD 必須顯示低佔用 empty state
- **AND** 不得新增 persisted pin state 或 tracked quest preference

### Requirement: Adventure HUD 必須顯示可見靈力 runtime
介面必須 (MUST) 在 Adventure 戰鬥中顯示目前靈力與最大靈力。

#### Scenario: 補靈丹恢復目前靈力
- **WHEN** 玩家在 Adventure 中使用 `heal_mp` 或 `full_restore` 補給
- **THEN** 介面必須更新目前靈力
- **AND** 若目前靈力已滿，補給必須顯示不可用或不消耗

### Requirement: Dashboard 突破區必須顯示準備狀態
介面必須 (MUST) 在突破區顯示成功率、風險與丹藥 / 屬性準備提示。

#### Scenario: 玩家查看突破按鈕
- **WHEN** 玩家打開道途面板
- **THEN** 突破區必須顯示可讀的 preview
- **AND** 失敗風險不得只藏在 log 或文件中

### Requirement: 商店介面必須顯示 NPC 態度與折扣來源
介面必須 (MUST) 在商店面板顯示目前 NPC 態度、折扣比例與來源。

#### Scenario: 玩家打開商店
- **WHEN** 玩家打開 ShopPanel
- **THEN** 介面必須顯示態度 label 與折扣來源
- **AND** 折扣後價格必須可和原價區分

### Requirement: Workshop recipe card 必須顯示終盤專精影響
介面必須 (MUST) 在 recipe card 顯示 active endgame specialization 是否影響該 recipe。

#### Scenario: recipe 被專精影響
- **WHEN** active specialization 影響目前 recipe
- **THEN** recipe card 必須顯示專精名稱與效果 cue
- **AND** 不得讓玩家誤以為核心材料可被跳過

### Requirement: 終盤地圖必須提供 v6 local hook
介面與資料必須 (MUST) 讓 180+ 終盤地圖提供 route rumor、Workshop 或 Reincarnation clue 的 local NPC / quest hook。

#### Scenario: 玩家查看終盤地圖 local content
- **WHEN** 玩家進入 180+ 終盤代表地圖
- **THEN** 地圖必須提供至少一個 v6 local NPC 或 dialogue-only quest
- **AND** 該內容必須說明 route memory、Workshop sink 或下一世 build hook

### Requirement: Mobile Adventure 必須提供可收合任務追蹤入口
介面必須 (MUST) 在 mobile viewport 提供低佔用任務追蹤入口，讓玩家可展開查看 active quests。

#### Scenario: Mobile 展開任務追蹤
- **WHEN** 玩家在 mobile viewport 點擊任務追蹤入口
- **THEN** 介面必須顯示 active quest 清單、類型、標題與進度文字
- **AND** 展開狀態不得新增 persisted pin state 或 tracked quest preference

#### Scenario: Mobile 收合任務追蹤不遮擋主要操作
- **WHEN** 任務追蹤處於收合狀態
- **THEN** 入口必須維持低佔用
- **AND** 不得遮擋底部 dock、action wheel、地圖 modal 或戰鬥目標卡主要操作

### Requirement: Reincarnation 介面必須顯示 v6 魂印來源
介面必須 (MUST) 在 Reincarnation flow 顯示 v6 魂印名稱、build identity、來源提示與鎖定原因。

#### Scenario: 玩家查看 v6 魂印
- **WHEN** 玩家打開 Reincarnation flow
- **THEN** 可用與鎖定的 v6 魂印都必須顯示 route / source cue
- **AND** 不得只顯示不可讀的內部 memory tag

### Requirement: Dashboard 必須顯示目前災劫後果
介面必須 (MUST) 在道途 / 突破區顯示目前突破 consequence、恢復方式與對下次突破的影響。

#### Scenario: 玩家有 active consequence
- **WHEN** 玩家打開道途面板且角色有 active breakthrough consequence
- **THEN** 介面必須顯示 consequence 名稱、嚴重度、剩餘狀態與恢復提示
- **AND** 突破 preview 必須顯示此 consequence 對風險的影響

### Requirement: NPC 與商店介面必須顯示持續性好感
介面必須 (MUST) 在 NPC / Quest / Shop 互動中顯示目前 affinity 等級、近期變化原因與折扣來源。

#### Scenario: 玩家打開商店或 NPC 任務
- **WHEN** 玩家打開 ShopPanel 或 QuestModal
- **THEN** 介面必須顯示 persisted affinity 與 deterministic baseline 的合併結果
- **AND** 折扣或任務提示必須能說明來源

### Requirement: 功法入口必須顯示角色已學功法與戰鬥配置
介面必須 (MUST) 將底部 `功法` 入口導向角色自身的功法面板，而不是萬界圖鑑的功法資料庫。

#### Scenario: 玩家打開功法面板
- **WHEN** 玩家點擊底部 `功法`
- **THEN** 介面必須顯示已學主動術式、被動心法與目前裝備主動功法
- **AND** 圖鑑仍必須保留所有功法與來源查詢

### Requirement: 功法秘卷商店必須說明參悟流程
介面必須 (MUST) 在功法秘卷商店顯示購買後需要到背包參悟，避免玩家把商店、圖鑑與已學功法面板混淆。

#### Scenario: 玩家打開藏經閣商店
- **WHEN** 玩家查看功法秘卷商品
- **THEN** 商品說明必須顯示購買後可在背包參悟
- **AND** 商品來源仍必須能在圖鑑中查詢

### Requirement: RPG 主畫面必須有穩定資訊架構
介面必須 (MUST) 維持穩定的 RPG 主畫面資訊架構，避免圖鑑、功法、任務、地圖與戰鬥操作互相混淆。

#### Scenario: 玩家進入主畫面
- **WHEN** 玩家進入 Adventure 主畫面
- **THEN** 左上必須保留角色狀態，左側承接任務追蹤，右上保留小地圖，底部 dock 保留主要功能入口
- **AND** `功法` 入口必須指向角色已學功法與戰鬥配置
- **AND** `圖鑑` 入口必須保持資料庫與來源查詢職責

### Requirement: 主畫面 HUD 必須提供 mobile-first 角色狀態
介面必須 (MUST) 在主畫面顯示 mobile-first 的角色狀態卡，包含名稱、境界、推導等級、HP、MP、戰力與活動狀態。

#### Scenario: 玩家在主畫面查看角色狀態
- **WHEN** 玩家進入 Adventure 主畫面
- **THEN** 左上角色狀態卡必須以 compact layout 顯示核心數值
- **AND** mobile viewport 不得因戰力、靈石、修為、壽元直列而佔用過多垂直畫面

### Requirement: 主畫面任務追蹤必須支援 desktop 與 mobile
介面必須 (MUST) 讓玩家在 Adventure 主畫面看到目前任務追蹤，且 desktop 與 mobile 都不得遮住主要操作。

#### Scenario: 玩家查看目前任務
- **WHEN** 玩家有 active quests
- **THEN** desktop 任務追蹤必須顯示在角色卡下方
- **AND** mobile 任務追蹤必須以低佔用入口收合並可展開

### Requirement: RPG 主畫面 Layout v2 必須有 runtime 狀態層
介面必須 (MUST) 在 Adventure 主畫面提供穩定的右上小地圖資訊層與右下戰鬥功法快捷狀態，讓 layout v2 不只停留在規格描述。

#### Scenario: 玩家在主畫面查看地圖與戰鬥狀態
- **WHEN** 玩家進入 Adventure 主畫面
- **THEN** 右上小地圖必須顯示目前地圖、座標、附近妖獸與 Boss 狀態
- **AND** 右下 action wheel 必須顯示目前目標、裝備主動功法與靈力可用狀態
- **AND** mobile viewport 下任務入口、底部 dock 與戰鬥快捷不得互相遮擋

### Requirement: 功法介面必須串起取得、參悟與裝備流程
介面必須 (MUST) 清楚說明功法秘卷取得後仍需到背包參悟，參悟後才會出現在功法面板並可裝備參戰。

#### Scenario: 玩家查看功法面板
- **WHEN** 玩家打開底部 `功法`
- **THEN** 面板必須顯示藏經閣、任務、怪物掉落或傳承取得秘卷的入口說明
- **AND** 必須說明秘卷需在背包參悟，已學主動術式可在此裝備參戰

### Requirement: 規劃文件不得把歷史待辦誤導為 active backlog
專案文件必須 (MUST) 清楚區分歷史 plan 與目前 active OpenSpec backlog，避免已完成 runtime 被舊 checklist 重新標成未完成。

#### Scenario: 開發者盤點未完成項目
- **WHEN** 開發者查看舊 plan 或 checklist
- **THEN** 文件必須指出已被後續 tracking / archive 吸收的 plan 不再是 active backlog
- **AND** active backlog 必須以 `openspec list` 與最新 tracking 節為準

### Requirement: 任務追蹤必須顯示下一主線並可導向
介面必須 (MUST) 在沒有 active quest 時顯示下一個可接主線任務，且任務追蹤項目必須可點擊導向對應 NPC、地圖或條件目的地。

#### Scenario: 玩家沒有接受任何任務
- **WHEN** 玩家進入 Adventure 主畫面且沒有 active quest
- **THEN** 任務追蹤必須顯示下一個符合前置條件的主線任務
- **AND** 點擊該項目必須導向任務起始 NPC 所在地圖與座標

#### Scenario: 玩家已有進行中任務
- **WHEN** 玩家點擊進行中的任務追蹤項目
- **THEN** 若任務可回報，必須導向回報 NPC
- **AND** 若任務需要對話，必須導向對話 NPC
- **AND** 若任務需要擊殺，必須導向包含目標妖獸的地圖

### Requirement: 任務追蹤必須貼近 compact 角色 HUD
介面必須 (MUST) 將 desktop 任務追蹤放在 compact 角色 HUD 下方，避免過度下移或重疊。

#### Scenario: 玩家在 desktop 主畫面查看 HUD
- **WHEN** compact 角色 HUD 與任務追蹤同時顯示
- **THEN** 任務追蹤必須在角色 HUD 下方
- **AND** 兩者距離必須足夠避免重疊，但不得形成過大的垂直空白

### Requirement: 任務追蹤卡片必須區分 lifecycle 狀態
介面必須 (MUST) 在任務追蹤卡片中清楚區分可接取、進行中、可回報與下一主線狀態，避免玩家無法判斷任務是尚未接受、正在進行或可以完成。

#### Scenario: 玩家查看任務追蹤卡片
- **WHEN** 任務追蹤顯示任務
- **THEN** 卡片必須顯示任務 lifecycle badge
- **AND** 可接取、進行中、可回報、下一主線不得只共用同一種文案或顏色語意

### Requirement: 任務追蹤必須顯示多目標進度列
介面必須 (MUST) 支援對話、討伐、提交物品、境界與複合任務的目標摘要與進度列。

#### Scenario: 任務具有多個條件
- **WHEN** 任務 requirements 包含多個條件
- **THEN** 任務追蹤必須逐列顯示每個目標類型與進度
- **AND** 主要導向仍必須指向下一個可行目標

#### Scenario: 任務需要提交物品
- **WHEN** 任務 requirement 為 item
- **THEN** 卡片必須顯示目前持有數量與需求數量

#### Scenario: 任務需要擊敗怪物
- **WHEN** 任務 requirement 為 kill
- **THEN** 卡片必須顯示目前擊殺進度與需求數量

#### Scenario: 任務需要對話或境界
- **WHEN** 任務 requirement 為 dialogue 或 level
- **THEN** 卡片必須顯示可讀的目標說明，而不是只顯示泛用進行中文字

### Requirement: 圖鑑物品頁必須依物品線分類
圖鑑物品頁必須 (MUST) 以玩家可理解的物品線分類呈現正式物品，並保留境界分段、description、品質與來源追蹤。功法與裝備必須維持圖鑑內的獨立入口，不得混入萬物圖鑑的一般物品分類。

#### Scenario: 玩家按萬物分類瀏覽物品
- **WHEN** 玩家打開萬物圖鑑
- **THEN** 介面必須提供丹藥、煉丹材料、煉器材料、任務物品、地區特產、貨幣代幣、符籙、陣盤、法寶器靈、突破物與其他分類
- **AND** 介面不得在萬物圖鑑分類中顯示功法秘卷或裝備
- **AND** 玩家選擇分類後，物品列表必須只顯示該分類內的物品
- **AND** 每張物品卡必須顯示主分類、原始子類、description、品質與來源追蹤

#### Scenario: 玩家瀏覽獨立功法與裝備入口
- **WHEN** 玩家打開萬界圖鑑
- **THEN** 功法必須維持獨立 `功法神通` tab
- **AND** 裝備必須有獨立 `裝備法寶` tab
- **AND** 萬物圖鑑不得顯示功法秘卷或裝備卡片

### Requirement: 圖鑑來源追蹤彈窗必須可讀且可分辨來源類型
圖鑑來源追蹤必須 (MUST) 讓玩家快速分辨掉落、商店販賣、工坊製作、工坊用途與奇遇路線，並能依怪物類型辨識掉落來源。

#### Scenario: 玩家查看裝備來源
- **WHEN** 玩家查看裝備法寶卡片的來源追蹤
- **THEN** 普通怪物掉落 badge 必須使用灰色
- **AND** 精英怪物掉落 badge 必須使用藍色
- **AND** 首領怪物掉落 badge 必須使用紅色
- **AND** `+更多` 彈窗必須以掉落、商店販賣、工坊製作、工坊用途、奇遇路線分組呈現
- **AND** 彈窗必須提供足夠寬度、固定最大高度與捲動能力，讓玩家可完整閱讀來源

#### Scenario: 玩家查看裝備品質 badge
- **WHEN** 玩家 hover 裝備卡右上角的單一品質 badge
- **THEN** 只應顯示該品質 badge 的 tooltip
- **AND** hover 整張卡片不得一次顯示全部品質 tooltip

### Requirement: 功法圖鑑必須按職業與境界呈現正式功法
介面必須 (MUST) 將 `功法神通` 作為獨立圖鑑入口，並以一致卡片樣式呈現通用、劍修、體修與法修正式功法。

#### Scenario: 玩家查看通用功法
- **WHEN** 玩家打開 `功法神通` 並切換到 `通用`
- **THEN** 介面必須依境界顯示正式通用功法
- **AND** 每張功法卡片必須顯示名稱、主動/被動、功法分類、通用或職業標籤、境界、描述與來源追蹤

#### Scenario: 玩家查看職業功法
- **WHEN** 玩家打開劍修、體修或法修功法分頁
- **THEN** 卡片視覺密度與資訊結構必須接近 `裝備法寶` 卡片
- **AND** `功法神通` 不得被歸入 `萬物圖鑑`

### Requirement: 裝備與功法圖鑑必須使用一致分類體驗
介面必須 (MUST) 讓 `裝備法寶` 與 `功法神通` 使用一致的 `通用 / 凌霄劍宗 / 萬獸山莊 / 縹緲仙宮` 分類模型與 amber 視覺語言。

#### Scenario: 玩家查看裝備法寶分類
- **WHEN** 玩家打開 `裝備法寶`
- **THEN** 介面必須顯示 `通用`、`凌霄劍宗`、`萬獸山莊`、`縹緲仙宮` 分類按鈕
- **AND** 裝備卡片必須只顯示目前分類對應的通用或職業裝備

#### Scenario: 玩家查看功法神通分類
- **WHEN** 玩家打開 `功法神通`
- **THEN** summary 與境界 heading 必須使用和 `裝備法寶` 一致的 amber 視覺語言
- **AND** 功法卡片仍必須顯示名稱、主動/被動、分類列、描述與來源追蹤
