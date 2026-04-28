# game-mechanics Specification

## Purpose
定義《Dusty Realm: Immortal Path》目前正式上線的修煉、地圖內戰鬥與輪迴轉生核心玩法真相。
## Requirements
### Requirement: 遊戲初始化流程 (Game Initialization)
系統必須 (MUST) 引導玩家完成首次入世或輪迴後的新一世角色建立，而不是只支援單次新手開局。

#### Scenario: 首次入世
- **WHEN** 玩家第一次進入遊戲且沒有 active current run
- **THEN** 顯示序幕、姓名 / 性別輸入與靈根覺醒流程
- **AND** 建立第一世角色的 current run 狀態

#### Scenario: 輪迴後投胎
- **WHEN** 玩家在輪迴大殿確認新的本世配置
- **THEN** 系統必須以選定的靈根、魂印與遺珍配置建立新的 current run
- **AND** 先前本世的地圖、背包、任務與戰鬥狀態必須重置為新一世初始值
- **AND** 靈魂進度必須保留並扣除已花費的功德

### Requirement: 修煉系統 (Cultivation System)
系統必須 (MUST) 允許角色透過時間流逝、手動引氣與突破來累積修為並晉升境界。

#### Scenario: 經驗值獲取公式
- **WHEN** 遊戲 Tick 觸發
- **THEN** 系統必須依靈根、根骨、聚靈等因素計算被動修煉收益
- **AND** 閉關與手動引氣必須套用對應的額外修煉倍率或冷卻限制

#### Scenario: 境界突破
- **WHEN** 修為已滿且玩家觸發突破
- **THEN** 系統必須根據大境界配置、悟性、福緣與道具效果執行成功率檢定
- **AND** 若失敗，必須依小境界 / 大境界規則扣除修為或承受更高代價

### Requirement: 背包與物品 (Inventory & Items)
系統必須 (MUST) 管理物品、裝備、技能書與突破素材，並讓它們影響角色成長、戰鬥補給或輪迴繼承。

#### Scenario: 物品類型定義
- **WHEN** 系統處理物品資料
- **THEN** 必須支援裝備、丹藥、材料、技能書、突破素材與其對應效果

#### Scenario: 輪迴候選遺珍
- **WHEN** 玩家本世結束
- **THEN** 系統必須從背包中辨識可作為遺珍的裝備實例與技能書
- **AND** 不得把一般材料或無效物件錯誤加入輪迴遺珍候選

#### Scenario: 基礎商店提供早期補給
- **WHEN** 玩家造訪凡人、早期宗門、宗門藏經閣或傳承商店
- **THEN** 商店必須提供可購買的基礎補給品、裝備、修為丹藥或正式秘卷
- **AND** 商店 item id 必須能在正式 item catalog 中找到
- **AND** 不得讓正式商店維持空列表

#### Scenario: 恢復類 consumable 具備正式效果
- **WHEN** 玩家使用帶有 `heal_hp`、`heal_mp` 或 `full_restore` effect 的 consumable
- **THEN** 系統必須只在對應資源可被正式 runtime 承接時套用效果並消耗道具
- **AND** 若目前 runtime 不支援該資源，必須阻擋或明確回報不可用原因
- **AND** `full_restore` 必須能在 HP 或 MP 任一可恢復資源未滿時套用，並不得要求不存在的資源
- **AND** 不得默默忽略恢復效果卻仍增加使用次數或扣除道具

#### Scenario: 補給來源與消耗品階層可追蹤
- **WHEN** 系統新增恢復品、修為丹或探索補給
- **THEN** 必須明確定義其主要來源為商店、掉落、Workshop 或 route-specific reward
- **AND** 中後期補給不得全部依賴單一低階道具支撐

### Requirement: 冒險與地圖內戰鬥 (Adventure & In-World Combat)
系統必須 (MUST) 提供網格地圖探索與地圖內時間軸戰鬥，而不是切換成舊式獨立回合制 modal。

#### Scenario: 地圖機制
- **WHEN** 玩家進入地圖
- **THEN** 系統必須根據 `MAPS` 資料生成地圖、傳送點、怪物與 Boss
- **AND** 地圖資料必須承接高境界內容密度、普通怪、精英怪與 Boss 配置

#### Scenario: 地圖內接戰
- **WHEN** 玩家或怪物在接戰範圍內發動普攻、技能或怪物特招
- **THEN** 戰鬥必須直接在 `Adventure` 場景內依 `attackRange / castRange / cooldownSeconds / castTimeMs / projectileSpeed / areaShape` 等資料解析
- **AND** 世界戰鬥、時間軸驗證與 replay 必須共用同一套 battle resolver 與 reward 流程

#### Scenario: 即時戰鬥怪物分工與前饋
- **WHEN** 玩家在地圖內與近戰、遠程、法術或 Boss 敵人接戰
- **THEN** 系統必須以不同站位、追擊、風箏、蓄力、危險區或投射物節奏表現怪物 archetype 差異
- **AND** 狀態、控制命中 / 免疫與危險區前饋必須沿用 battle core 語意，不得分裂為另一套規則

### Requirement: 輪迴轉生與靈魂進度 (Reincarnation & Soul Progression)
系統必須 (MUST) 在角色結束本世時，把本世成果轉換為可跨周目累積的靈魂進度。

#### Scenario: 生涯結算轉換為功德
- **WHEN** 玩家本世結束
- **THEN** 系統必須根據本世最高大境界與享年計算功德
- **AND** 更新 Lifetime Stats，至少包含最高境界、最高年歲、死亡次數與轉生次數

#### Scenario: 輪迴大殿配置下一世
- **WHEN** 玩家進入輪迴大殿
- **THEN** 系統必須顯示可用功德、已解鎖魂印、可帶入的遺珍與本世結算摘要
- **AND** 玩家只能在合法的功德預算與遺珍限額內建立下一世配置

#### Scenario: 靈魂進度跨周目保留
- **WHEN** 完成轉生並開始新一世
- **THEN** 靈魂進度必須保留
- **AND** current run 相關資料必須重建
- **AND** 不得讓上一世的 current run 狀態殘留到新一世

### Requirement: 宗門中期成長線必須延伸到金丹階段

系統 MUST 為玩家已加入的宗門提供不只入門試煉，而是能從 `築基` 推進到 `金丹` 的正式任務承接。

#### Scenario: 已加入宗門的玩家可接續宗門中期任務

- **WHEN** 玩家已完成任一宗門的加入任務與第一個宗門試煉
- **THEN** 系統必須提供該宗門後續的中期任務鏈
- **AND** 該鏈至少要承接 `築基` 與 `金丹` 兩個階段

### Requirement: 宗門中期任務必須維持路線專屬辨識

系統 MUST 讓劍宗、獸莊、仙宮的中期任務在 NPC、目標或獎勵上維持清楚的職業路線差異。

#### Scenario: 不同宗門的中期任務不應退化成同模板換名字

- **WHEN** 玩家比較不同宗門的中期任務鏈
- **THEN** 系統必須在 quest giver、任務敘事、目標 boss 或獎勵配置上提供明確差異
- **AND** 不得讓三宗中期內容只剩相同模板的名稱替換

### Requirement: 宗門中期內容不得依賴新的 quest engine 形狀

系統 MUST 能在現有 quest 資料結構與互動流程下承接宗門中期內容，而不是把內容補量綁定在新的 quest engine overhaul 上。

#### Scenario: 宗門中期任務可在既有 quest 流程中成立

- **WHEN** 開發者新增宗門中期任務
- **THEN** 任務必須能透過現有 `giverId`、`submitNpcId`、`prerequisiteQuestId` 與簡單 requirement 組合完成
- **AND** 不得要求新的多分支或多條件 completion model 才能上線

### Requirement: 洞府百業支撐型成長循環
系統必須 (MUST) 讓 `聚靈陣 / 煉丹 / 煉器` 成為正式可迭代的當世成長循環，而不是僅剩單一卡片或 placeholder。

#### Scenario: Workshop 提供穩定成長底盤
- **WHEN** 玩家在洞府百業介面投入靈石、材料或 recipe 資源
- **THEN** 系統必須提供可驗證的聚靈、丹藥或煉器收益
- **AND** 這些收益必須能接回 cultivation、戰鬥 build 或資源循環

#### Scenario: 高境界乘區有對應來源
- **WHEN** 玩家進入 `化神 -> 仙帝` 的中後期循環
- **THEN** `丹藥 / 洞府` 必須承接對應乘區來源
- **AND** 不得讓高境界 multiplier 只存在於 audit table 而沒有對應玩法

### Requirement: 正式事件與奇遇循環
系統必須 (MUST) 將時間推進中的遭遇擴充為正式 event / encounter system，而不是只留下 flavor log。

#### Scenario: event 具有選項與結果
- **WHEN** 時間推進觸發事件或奇遇
- **THEN** 玩家必須看到可選擇的處理分支
- **AND** 每個選項都必須對應明確的收益、風險或資源結果

#### Scenario: event / encounter 承接路線差異
- **WHEN** 玩家處於不同境界、地圖路線或 build 節奏
- **THEN** 系統必須提供 route-specific 或 progression-sensitive 的事件差異
- **AND** 不得把所有奇遇都做成相同的純數值彈窗

### Requirement: 像素風 prototype 必須保留 Adventure 語意
系統必須 (MUST) 讓像素風 vertical slice 承接現有 `Adventure` 的地圖與戰鬥語意，而不是另外做一套脫鉤的展示場景。

#### Scenario: 像素風場景沿用格子與地圖資料
- **WHEN** prototype 場景載入代表性地圖
- **THEN** 玩家、怪物、傳送門與目標 focus 必須沿用現有格子座標與地圖資料語意
- **AND** 不得為了畫面原型重寫另一套冒險資料結構

#### Scenario: 像素風場景保留 live combat cue 前饋
- **WHEN** 玩家在 prototype 場景中與近戰或遠程 / 法術怪接戰
- **THEN** 必須能看見近戰命中、投射物、危險區 telegraph 與 target / status cue
- **AND** 這些 cue 必須對應現有 live combat archetype，而不是脫離 battle core 另外命名

### Requirement: 事件內容庫覆蓋率
系統必須 (MUST) 讓正式 encounter pool 在中後期與終盤境界段維持可追蹤的內容覆蓋率，避免某些境界或路線只剩少量一次性事件。

#### Scenario: 中後期境界保有最低事件覆蓋
- **WHEN** 系統載入 encounter pool
- **THEN** `元嬰 / 化神 / 煉虛 / 合體 / 大乘 / 渡劫 / 仙人 / 仙帝` 等主要中後期與終盤階段必須有可被 regression 驗證的事件覆蓋
- **AND** 不得讓任一主要階段只依賴單一 one-time 事件支撐

#### Scenario: 路線事件保有辨識度
- **WHEN** 玩家以不同職業、宗門或世界路線觸發 encounter
- **THEN** 事件必須提供可辨識的 `routeLabel`、`categoryLabel`、cue tag、材料來源或 reward 差異
- **AND** 不得把所有 route-specific event 退化成同模板純數值收益

#### Scenario: 高境界 coverage floor 包含仙人與仙帝
- **WHEN** 系統載入 `化神 -> 仙帝` encounter pool
- **THEN** 每個高境界必須保有最低事件量與可重複事件量
- **AND** `仙人 / 仙帝` 不得被排除在 coverage regression 之外

#### Scenario: 終盤 route-specific event 可重複出現
- **WHEN** 玩家到達 `仙帝` 且已完成對應宗門後段路線
- **THEN** encounter selector 必須能提供對應職業 / 宗門的 route-specific 終盤事件
- **AND** 該事件必須不是 `once_per_run`，避免終盤內容密度只靠一次性 milestone

#### Scenario: v3 route aftermath 延續世界章節記憶
- **WHEN** 玩家完成三宗 v3 world chapter 並取得 `sect:*:world-chapter-03`
- **THEN** encounter selector 必須提供對應路線的 repeatable aftermath event
- **AND** aftermath event 必須讀取對應 world memory tag，缺少記憶時不得出現
- **AND** aftermath event 不得是 `once_per_run`

#### Scenario: 既有高境界事件保留可讀 cue
- **WHEN** 高境界通用 encounter 進入 pending flow
- **THEN** 事件必須提供 `categoryLabel / routeLabel` 與每個 choice 的 cue tags
- **AND** 玩家不得只能從長描述猜測成本、收益、材料或風險

### Requirement: 宗門與世界後段內容延伸
系統必須 (MUST) 讓宗門與世界內容在 `金丹` 後繼續承接玩家路線，至少延伸到 `元嬰` 里程碑，而不是在中期任務後斷線。

#### Scenario: 三宗後段任務承接金丹真傳
- **WHEN** 玩家完成任一宗門的 `金丹` 真傳任務並抵達 `元嬰`
- **THEN** 系統必須提供該宗門的後段任務
- **AND** 後段任務必須要求對應 route 的 `元嬰` boss 或世界內容
- **AND** 不得讓三宗後段全部退化成同一個通用任務

#### Scenario: 後段任務保留化神接續點
- **WHEN** 玩家完成 `元嬰` 後段宗門任務
- **THEN** 任務文本、文件或後續掛點必須指向 `化神` 三界戰場 convergence
- **AND** 不得讓宗門後段在 `元嬰` boss 結束後再次失去世界承接

#### Scenario: 後段世界 encounter 依路線解鎖
- **WHEN** 玩家完成宗門後段任務或達到對應後段條件
- **THEN** encounter selector 必須能提供對應 profession / sect 的 route-specific world event
- **AND** 該事件必須具備可辨識的 route label、風險收益 cue 或材料回饋

#### Scenario: 後段內容維持既有資料模型
- **WHEN** 系統新增後段宗門與世界內容
- **THEN** 必須沿用現有 `Quest / NPC / Encounter` 結構
- **AND** 不得要求新的 persisted state migration 才能讀取舊存檔

#### Scenario: Aftermath 讀取既有 world memory
- **WHEN** v3 aftermath encounter 需要判斷玩家是否完成對應 route chapter
- **THEN** 系統必須讀取既有 `soul.worldMemoryTags`
- **AND** 不得新增重複的 persisted aftermath unlock state

### Requirement: 宗門後段世界章節承接
系統必須 (MUST) 讓三宗 `task_04` 之後的故事能接入後段世界章節，而不是只把玩家推到地圖後停止追蹤。

#### Scenario: task_04 後出現世界章節入口
- **WHEN** 玩家完成任一宗門的 `task_04` 並進入對應後段條件
- **THEN** 系統必須提供可追蹤的世界章節任務、NPC 對話或 milestone encounter
- **AND** 該章節必須能指向 `三界戰場 / 隕仙深淵 / 煉虛節點` 等後段世界內容

#### Scenario: 後段內容維持宗門路線辨識
- **WHEN** 不同宗門玩家推進後段世界章節
- **THEN** 系統必須保留該宗門或職業路線的文案、目標、reward cue 或 event cue 差異
- **AND** 不得讓三宗後段全部退化成同一段無差別世界任務

### Requirement: Workshop route material source 與專精解鎖
系統必須 (MUST) 讓高階 Workshop 材料來源與專精選擇具備可追蹤條件，而不是無成本、無路線辨識的通用開關。

#### Scenario: Route-specific material source 可追蹤
- **WHEN** 玩家透過世界事件、宗門里程碑或高境界 encounter 取得 `凌霄劍星鋼 / 縹緲星魂蓮 / 萬獸血骨殘材`
- **THEN** 系統必須保留來源 cue、route label 或 profession / realm 條件
- **AND** 不得把這些材料退化成無條件通用掉落

#### Scenario: Workshop 專精需要符合解鎖條件
- **WHEN** 玩家嘗試啟用 `Alchemy / Smithing` 專精
- **THEN** 系統必須檢查對應的 mastery、境界、路線成就或其他明確 requirement
- **AND** 未達條件時不得直接套用專精效果

#### Scenario: 專精切換不得繞過高階材料 sink
- **WHEN** 玩家使用已解鎖的 Workshop 專精 craft 高階 recipe
- **THEN** 專精可以影響靈石成本、熟練收益或 UI cue
- **AND** 不得減免或跳過 recipe 指定的 route-specific 材料消耗

#### Scenario: v3 route chapter 記憶供應高階百業分支
- **WHEN** 玩家完成 `sect:sword:world-chapter-03`、`sect:beast:world-chapter-03` 或 `sect:mystic:world-chapter-03`
- **THEN** Workshop 必須能以 high-tier recipe branch、source hint、route tag 或 specialization cue 承接該 route memory
- **AND** 對應 recipe 仍必須消耗原本的 `sword_path_starsteel / beast_path_bloodbone / mystic_path_starlotus` route-specific material sink
- **AND** 不得因承接 v3 route memory 而新增第二套 Workshop persisted state

### Requirement: 退場技能正式退出玩家成長主線
系統必須 (MUST) 讓 `transition / legacy` 技能退出正式玩家成長主線，只保留 formal core 技能作為常規學習與顯示對象。

#### Scenario: 玩家可見技能與秘卷視圖只保留 formal core
- **WHEN** 系統建立玩家可見的技能、秘卷、獎勵或圖鑑視圖
- **THEN** `transition / legacy` 技能不得作為正式項目顯示給玩家
- **AND** 玩家可見資料必須只保留 formal core 技能或其正式秘卷

#### Scenario: 舊技能引用會映射到正式核心技能
- **WHEN** 系統遇到舊 skill id、舊秘卷 item id 或其他 retired skill 引用
- **THEN** 必須依 `replacementSkillId` 映射到正式 formal core 技能
- **AND** 不得把 retired skill 重新放回正式技能池或正式技能書來源

#### Scenario: 多個 retired skill 映射到同一 formal core 後不重複保留
- **WHEN** 角色已學技能或舊引用經過 migration 後映射到相同的 formal core skill id
- **THEN** 系統必須只保留一份 formal core skill id
- **AND** 角色技能列表不可因 retired alias 遷移產生重複項

### Requirement: 洞府百業支撐循環 (Workshop Support Loop)
系統必須 (MUST) 提供正式的 `Workshop` 支撐型成長循環，讓聚靈、煉丹與煉器成為可操作的 build 支撐來源。

#### Scenario: 聚靈陣升級
- **WHEN** 玩家在 `Workshop` 內升級聚靈陣
- **THEN** 系統必須檢查靈石成本並更新聚靈等級
- **AND** 成功升級後必須影響當世修煉效率或等效的支撐倍率

#### Scenario: 配方製作
- **WHEN** 玩家在 `Workshop` 內煉丹或煉器
- **THEN** 系統必須檢查配方解鎖、百業等級、靈石成本與材料消耗
- **AND** 成功施作後必須交付對應丹藥或裝備產出

### Requirement: 事件與奇遇選項流程 (Encounter Choice Flow)
系統必須 (MUST) 讓 yearly encounter 以正式選項流程承接，而不是只留下 flavor log。

#### Scenario: 年度遭遇浮現
- **WHEN** 時間推進觸發 encounter roll 且角色處於可遊玩 current run
- **THEN** 系統必須建立 pending encounter
- **AND** 正式流程必須在玩家解決遭遇前保留這筆 pending state

#### Scenario: 選項結果結算
- **WHEN** 玩家選擇 pending encounter 的某個分支
- **THEN** 系統必須結算對應修為、靈石、物品或等效收益
- **AND** 必須把該事件標記為已解決並清除 pending state

### Requirement: 宗門中期成長線 (Sect Midgame Progression)
系統必須 (MUST) 讓玩家在 `築基 -> 金丹` 中期階段擁有正式宗門任務與 NPC 成長承接，而不是只有入門一次性任務。

#### Scenario: 宗門中期 quest readiness
- **WHEN** 玩家完成宗門前置任務並與對應 NPC 互動
- **THEN** 系統必須根據 quest chain readiness 決定可接續的中期任務
- **AND** 不得讓錯誤 NPC 或未達條件的角色跳過任務鏈

#### Scenario: 宗門中期擊殺進度
- **WHEN** 玩家在中期宗門任務期間完成指定擊殺或對應目標
- **THEN** 系統必須更新 quest progress
- **AND** 任務完成後必須能交回對應 NPC 並承接下一段成長線

### Requirement: 地圖內即時戰鬥表現層
系統必須 (MUST) 在地圖場景內提供正式的即時戰鬥表現層，而不是只依賴距離接戰或 battle modal 輔助閱讀。

#### Scenario: 玩家與目標維持同場即時戰鬥 HUD
- **WHEN** 玩家在地圖內與怪物進入戰鬥狀態
- **THEN** 系統必須顯示玩家與目標的血條資訊
- **AND** 系統必須顯示玩家主動技能冷卻與最近戰況資訊
- **AND** 戰鬥資訊不得要求重新切回大型 battle modal 才能閱讀

#### Scenario: 攻擊與命中在地圖場景內播放
- **WHEN** 玩家或怪物在地圖內完成一次普攻或技能施放
- **THEN** 系統必須在地圖場景內播放對應的攻擊前搖、命中回饋與掉血結果
- **AND** 掉落結算與擊殺移除必須和同場播放時序一致

#### Scenario: 射程與 AI 行為有可辨識的場上表現
- **WHEN** 近戰、遠程或 Boss 單位在地圖內選擇攻擊方式
- **THEN** 系統必須以追擊、風箏、技能圈或投射物飛行時間呈現其射程與攻擊差異
- **AND** 玩家可在地圖場景中直接辨識危險區與攻擊來源

#### Scenario: 即時戰鬥表現延續 2D / 2.5D 路線
- **WHEN** 專案擴充地圖內即時戰鬥表現
- **THEN** 系統必須優先延續現有 `PixiJS` 同場戰鬥路線
- **AND** 不得把本需求視為全面 `Three.js` 3D 重寫的前置要求

### Requirement: 仙帝端終盤內容密度與路線辨識
系統必須 (MUST) 讓 `仙帝` 端終盤內容同時維持足夠密度、路線辨識度與可追蹤的 representative regression 門檻。

#### Scenario: 仙帝端不再明顯薄於其他高境界
- **WHEN** 玩家進入 `仙帝` 端主線地圖與對應壓力支線
- **THEN** 系統必須提供與其他高境界相稱的普通怪、精英怪與 Boss 壓力節奏
- **AND** 不得讓終盤主線或支線明顯退化成內容稀薄的長空檔

#### Scenario: 仙帝路線具有專屬怪物與掉落辨識
- **WHEN** 玩家刷 `仙帝` 高境界普通怪、精英怪與對應路線
- **THEN** 掉落、材料或怪物組成必須提供明確的路線專屬辨識
- **AND** 不得只剩純數值升級而缺乏終盤路線主題差異

#### Scenario: 仙帝 representative regression 固定終盤門檻
- **WHEN** 後續調整 `仙帝` 端怪物、掉落或地圖密度
- **THEN** 系統必須保有 representative build 與跨境界挑戰 regression 驗證
- **AND** 變更不得在沒有測試訊號的情況下意外放鬆終盤門檻

### Requirement: 事件與奇遇必須具備上下文條件與風險收益分化

系統必須 (MUST) 讓正式 encounter system 依玩家上下文挑選事件，並提供可辨識的選項風險與收益，而不是只做同境界共用的平鋪領獎事件。

#### Scenario: encounter selection 依上下文挑選事件

- **WHEN** 年歲流逝或正式事件流程觸發 encounter selection
- **THEN** 系統必須至少考慮 `majorRealm` 與其他已存在的玩家上下文條件來挑選合適事件
- **AND** 不得讓所有同境界玩家長期只輪到相同的通用事件池

#### Scenario: one-time event 不重複洗出

- **WHEN** 玩家已完成標記為 one-time 或不可重複的正式事件
- **THEN** 系統必須透過 encounter resolution 記錄避免同一事件重複洗出
- **AND** 若上下文仍有其他合法事件，selector 必須優先改派其他事件

#### Scenario: choice 具備正式風險收益差異

- **WHEN** 玩家面對正式 encounter choice
- **THEN** 不同選項必須提供可區分的成本、風險或收益方向
- **AND** encounter rewards 必須能承接 profession、sect、route-specific 或高境界 progression 的正式內容差異

### Requirement: 高階洞府百業深度循環
系統必須 (MUST) 讓 `煉丹 / 煉器` 從第一批低階 recipe 擴充為可支撐 `化神 -> 仙帝` 的高階百業循環，並保留可追蹤的材料 sink、品質分化與專精進度。

#### Scenario: 高階 recipe 承接中後期材料與境界需求
- **WHEN** 玩家達到中後期境界並取得宗門、世界、encounter 或高境界掉落材料
- **THEN** 系統必須提供對應的高階丹方或器方
- **AND** recipe 必須標示最低境界、材料需求、route tags 或材料來源語意
- **AND** 不得讓高境界丹藥 / 裝備支撐只存在於 audit table 而缺少實際 recipe 入口

#### Scenario: 百業產出具有品質或專精辨識
- **WHEN** 玩家完成高階煉丹或煉器 recipe
- **THEN** 系統必須產出可辨識的品質、裝備實例、丹藥或專精進度
- **AND** 應記錄對應 discipline 的 craft mastery 或 specialization 進度
- **AND** 不得讓所有 recipe 都退化成固定低階物品交換

#### Scenario: 高境界 loop support 指向真實高階百業來源
- **WHEN** 系統驗證 `化神 -> 仙帝` 的丹藥 / 洞府支撐乘區
- **THEN** regression 必須能追蹤到真實 high-tier workshop recipe、物品或材料來源
- **AND** 不得只以 placeholder feature id 代表完整後期百業循環

### Requirement: 即時戰鬥怪物分工與狀態可讀性
系統必須 (MUST) 在地圖內即時戰鬥中，為不同怪物分工提供可辨識的行為節奏，並讓狀態與控制結果維持和 battle core 一致的可讀性。

#### Scenario: 不同怪物 archetype 具有可辨識的戰鬥節奏
- **WHEN** 玩家在地圖內與近戰、遠程、法術或 Boss 敵人接戰
- **THEN** 系統必須以明確不同的站位、追擊、蓄力或危險區節奏表現這些 archetype
- **AND** 不得把所有敵人都退化成相同的貼臉追擊或相同的出手提示

#### Scenario: 控制與狀態提示沿用 battle core 語意
- **WHEN** 即時戰鬥中發生暈眩、冰凍、放逐、易傷、護盾、控制免疫或其他 formal status 結果
- **THEN** live-combat 提示必須沿用 battle core 已有的 status 語意
- **AND** world / timeline / replay 的結果敘事不可分裂成互相矛盾的三套規則

#### Scenario: 蓄力、免疫與危險區有明確前饋
- **WHEN** 敵人準備施放特招、控制被免疫或危險區即將生效
- **THEN** 系統必須在命中前或事件發生時提供清楚的前饋提示
- **AND** 玩家不必只靠戰鬥日誌回推發生了什麼

### Requirement: 輪迴大殿 build planning 深化
系統必須 (MUST) 讓輪迴配置成為真正的多周目 build 規劃，而不是固定單一路徑。

#### Scenario: 魂印與遺珍形成不同開局
- **WHEN** 玩家在 `Reincarnation Hall` 選擇不同的 perk、靈根改寫與遺珍組合
- **THEN** 系統必須為下一世建立對應的起手資源、屬性偏向或遺珍繼承結果
- **AND** 不得把所有輪迴配置壓回幾乎相同的開局

#### Scenario: 進階 planner 依里程碑解鎖
- **WHEN** 玩家累積更多輪迴次數、最高境界或等效生命里程碑
- **THEN** 系統必須解鎖對應的進階 planner 條目
- **AND** 玩家不應在第一輪就無條件取得所有高階輪迴配置

#### Scenario: v3 route memory 解鎖高階本命魂印
- **WHEN** 玩家完成三宗 v3 world chapter 並取得 `sect:sword:world-chapter-03`、`sect:beast:world-chapter-03` 或 `sect:mystic:world-chapter-03`
- **THEN** 輪迴 planner 必須能以既有 `soul.worldMemoryTags` 解鎖對應的高階劍修、體修或法修本命魂印
- **AND** 本命魂印必須維持對應 build lane 與 heirloom compatibility 限制
- **AND** 不得為相同 route memory 新增另一套 persisted unlock state

### Requirement: 主動坐化沿用正式結算語意
系統必須 (MUST) 讓 `主動坐化` 與死亡型輪迴共用同一套結算與 rebirth pipeline。

#### Scenario: 主動坐化結算
- **WHEN** 玩家透過正式入口主動結束本世
- **THEN** 系統必須照常計算本世 merit、Lifetime Stats 與遺珍候選
- **AND** 不得繞過 `Life Review` 或直接跳到新角色初始化

### Requirement: 技能書來源層級與學習限制
系統必須 (MUST) 為正式 `core` 技能書提供明確的 acquisition tier、具體取得 route、圖鑑可讀來源與學習限制。

#### Scenario: 正式技能書帶有 acquisition tier 與來源 metadata
- **WHEN** 系統根據正式 `core` 技能生成技能書
- **THEN** 每本技能書都必須帶有 acquisition tier
- **AND** 每本技能書都必須帶有至少一個正式來源類型
- **AND** 每本技能書都必須帶有職業 / 境界 / 前置技能限制 metadata

#### Scenario: 正式技能書可推導具體取得 route
- **WHEN** 系統建立正式 `core` 技能書 routing
- **THEN** 每本 formal core manual 都必須能推導至少一個具體 route，例如商店 id、敵人 id、宗門試煉或傳承殿
- **AND** route 不得指向 retired manual、missing item 或不存在的商店 / 敵人
- **AND** routing helper 必須從既有 `SHOPS`、`BESTIARY` 與 skill manual metadata 推導，不得另建手寫平行表

#### Scenario: 圖鑑可讀取技能書來源
- **WHEN** 圖鑑顯示正式 core skill 或其秘卷
- **THEN** 系統必須能從既有 skill manual metadata 推導商店、宗門試煉、精英掉落、Boss 掉落或傳承來源
- **AND** 若商店或敵人資料能定位具體名稱，圖鑑必須顯示具體來源名稱
- **AND** 不得為圖鑑另建一套會和正式 skill manual registry 脫節的來源資料

#### Scenario: 宗門試煉與正式技能池保持同步
- **WHEN** 宗門試煉配置入門技能書獎勵
- **THEN** 獎勵必須由正式技能池導出對應職業的練氣主動核心技能書
- **AND** 不可依賴手寫硬編碼 skill id 維護

#### Scenario: 玩家可先購得未達境界的技能書
- **WHEN** 玩家在商店查看技能書
- **THEN** 系統必須顯示該商店正式投放的技能書，即使玩家尚未達到參悟境界
- **AND** 玩家仍只能在符合職業、境界與前置技能條件後參悟該技能書

#### Scenario: 退場技能不再混入正式技能書取得池
- **WHEN** 系統建立正式技能書來源與學習資料
- **THEN** `transition / legacy` 技能不得出現在 shop、elite、boss 或 inheritance formal source pool
- **AND** 若舊 manual id 仍存在於存檔或舊資料，必須先映射到正式 replacement manual

### Requirement: 物品與材料來源可追蹤
系統必須 (MUST) 讓正式物品、材料與秘卷可由既有 catalog、掉落、商店、Workshop recipe 或 encounter reward 推導來源與用途。

#### Scenario: Route material 來源與 sink 可回溯
- **WHEN** 圖鑑顯示 `凌霄劍星鋼`、`萬獸血骨殘材` 或 `縹緲星魂蓮`
- **THEN** 系統必須能顯示對應宗門、world memory tag、encounter source cue 與 high-tier Workshop sink
- **AND** 不得讓 route-specific material 只顯示「無紀錄」或只顯示抽象描述

#### Scenario: 來源追蹤沿用既有資料
- **WHEN** 系統建立圖鑑 source tracing view
- **THEN** 來源必須從 `Enemy.drops`、`SHOPS`、`WORKSHOP_RECIPES`、encounter rewards 或 skill manual metadata 推導
- **AND** 不得新增另一套需要手動同步的 persisted source registry

### Requirement: Workshop recipe 與專精深化
系統必須 (MUST) 讓 Workshop 在既有高階 recipe 與熟練度基礎上，提供更多中高階 / 終盤 recipe 與可追蹤的專精效果，而不是讓 `specializationByDiscipline` 只停留在存檔欄位。

#### Scenario: 中高階 recipe 擴量
- **WHEN** 玩家進入中後期或終盤並取得 route-specific materials
- **THEN** Workshop 必須提供多個可追蹤來源、境界需求與 route tags 的高階丹方或器方
- **AND** 新 recipe 不得只消耗通用低階材料

#### Scenario: 專精效果影響 craft
- **WHEN** 玩家設定 `alchemy` 或 `smithing` 專精後施作受影響 recipe
- **THEN** craft action 必須套用對應專精效果，例如成本、輸出、品質提示或 mastery 節奏
- **AND** 不得繞過高階 recipe 的核心 route-specific material sink

#### Scenario: 專精與熟練度可 regression
- **WHEN** 後續調整 Workshop recipe 或 specialization effect
- **THEN** tests 必須能驗證 craft outcome、material cost、mastery 變化與 route-specific gate
- **AND** 不得在沒有測試訊號的情況下讓高境界百業失去材料壓力

### Requirement: Workshop 專精樹
系統必須 (MUST) 讓 `Alchemy / Smithing` 專精從單一扁平選項升級為可擴充的專精樹，並維持 recipe、材料 sink 與熟練度規則的一致性。

#### Scenario: 專精節點具有前置與互斥
- **WHEN** 玩家嘗試解鎖或切換 Workshop 專精節點
- **THEN** 系統必須檢查熟練度、境界、前置節點、材料或靈石成本
- **AND** 若節點與已選分支互斥，必須阻止或要求合法 reset

#### Scenario: 專精效果不繞過核心材料 sink
- **WHEN** 專精效果套用到高階 recipe
- **THEN** 系統可以調整靈石成本、熟練收益、品質或副產物
- **AND** 不得直接免除 recipe 的核心 route-specific 材料需求

### Requirement: 事件鏈與世界記憶
系統必須 (MUST) 讓正式 encounter 能記錄可被後續內容讀取的事件鏈與世界記憶，而不是只做單次 reward 結算。

#### Scenario: 事件結果形成後續記憶
- **WHEN** 玩家解決帶有 chain 或 memory tag 的 encounter
- **THEN** 系統必須保存該結果供後續 selector、宗門章節或 Workshop source 判斷
- **AND** 不得只依賴不可追蹤的純文字日誌

#### Scenario: 事件鏈依前置結果展開
- **WHEN** 後續 encounter 需要前置 chain step 或 world memory
- **THEN** selector 必須檢查對應條件後才允許該事件出現
- **AND** 若條件不成立，必須改派其他合法事件或不生成 pending event

### Requirement: 宗門世界路線章節 v2
系統必須 (MUST) 讓三宗後段內容延伸為可追蹤的跨地圖 route chapter，而不是只停在單次任務節點。

#### Scenario: 三宗章節保留路線差異
- **WHEN** 玩家推進不同宗門的後段章節
- **THEN** 任務、NPC、encounter 或 reward cue 必須保留該宗門路線辨識
- **AND** 不得讓三宗章節只剩同模板換名

#### Scenario: 章節結果能餵給後續系統
- **WHEN** 玩家完成 route chapter 的重要節點
- **THEN** 系統必須能提供可被 encounter memory、Workshop source 或後續 quest 讀取的結果
- **AND** 不得只寫入不可查詢的日誌文字

#### Scenario: v3 章節延伸到渡劫與仙人節點
- **WHEN** 玩家完成三宗 `chapter_02` 並抵達 `渡劫`
- **THEN** 系統必須提供對應宗門的 v3 route chapter，並透過 `劫雲荒原 / 接引仙殿` 等 map-local NPC 或 quest hook 顯示下一步
- **AND** 完成後必須能解鎖對應仙人期 milestone encounter 與 `sect:*:world-chapter-03` 類 world memory tag
- **AND** 不得因 v3 章節新增 persisted schema 或 migration

### Requirement: Workshop 經濟與專精深化 v2
系統必須 (MUST) 讓 Workshop mastery、specialization leaf 與 route-specific material sink 形成中後期決策，而不是只提供扁平 recipe 製作。

#### Scenario: Mastery milestone 影響高階製作
- **WHEN** 玩家累積指定 discipline 的 mastery
- **THEN** 系統必須提供可驗證的 milestone、專精 leaf 或 recipe effect
- **AND** 不得只把 mastery 當成無回饋數值

#### Scenario: 專精效果不跳過材料 sink
- **WHEN** 玩家使用 specialization craft 高階 recipe
- **THEN** 專精可以影響品質、靈石、副產物或 mastery
- **AND** 不得繞過 recipe 指定的 route-specific 材料消耗

### Requirement: 輪迴 build diversity v2
系統必須 (MUST) 讓輪迴配置提供可辨識的下一世 build 方向，而不是只提供泛用數值加成。

#### Scenario: 下一世 build 具有策略辨識
- **WHEN** 玩家在輪迴大殿選擇 perk、魂印或遺珍
- **THEN** 系統必須能形成可辨識的 build identity
- **AND** 不得讓所有合法配置只剩相同的泛用成長倍率

#### Scenario: 跨世資訊不污染 current run
- **WHEN** 輪迴 v2 使用 lifetime stats 或 world memory 作為 planner 參考
- **THEN** 系統必須只讀取合法的 soul / memory 摘要
- **AND** 不得把上一世背包、任務或地圖狀態帶入新一世

#### Scenario: v3 輪迴 hook 沿用既有 soul 記憶
- **WHEN** 輪迴 planner 判斷三宗 v3 route seal 是否可用
- **THEN** 系統必須只讀既有 `soul.worldMemoryTags` 與既有 `rebirthConfig`
- **AND** 不得新增新的 soul schema、current run schema 或 migration

### Requirement: Base spec truth release gate
系統必須 (MUST) 讓完成的正式功能回寫 base specs 與 tracking docs，避免實作完成但規格真相停留在舊狀態。

#### Scenario: 功能 change 完成
- **WHEN** 任一 OpenSpec change 的實作、測試與文件完成
- **THEN** 該 change 必須更新對應 tasks 為完成狀態
- **AND** 封存前必須確認 base specs 已吸收正式行為或明確使用 `--skip-specs` 的理由

#### Scenario: 後續主線選擇
- **WHEN** 一條主線完成並準備選下一條 backlog
- **THEN** 必須先檢查 `openspec list`、base specs 與 tracking docs
- **AND** 不得只依賴舊審計文字判斷下一步

### Requirement: 內容 authoring audit
系統必須 (MUST) 提供可被 regression 執行的內容 authoring audit，避免資料 catalog 擴量時產生靜態 reference 斷線。

#### Scenario: Catalog item reference 可被 audit
- **WHEN** 開發者新增 quest、encounter、shop、enemy drop 或 Workshop recipe
- **THEN** audit 必須能檢查所有 item id 是否存在於正式 `ITEMS` catalog
- **AND** 錯誤訊息必須能指出斷線來源

#### Scenario: NPC 與 quest reference 可被 audit
- **WHEN** 開發者新增 map NPC、quest giver、submit target 或 dialogue target
- **THEN** audit 必須能檢查 quest id 與 NPC id 是否存在於正式 catalog
- **AND** 不得讓 map-local hook 指向不存在的 quest 或 NPC

#### Scenario: Route material source 與 sink 可被 audit
- **WHEN** 開發者新增 route-specific material
- **THEN** audit 必須能檢查該材料至少具備正式 source、Workshop sink 與圖鑑 source tracing
- **AND** 不得只新增消耗或只新增來源而沒有另一端

### Requirement: Encounter v3 不改 persisted state
系統必須 (MUST) 在擴張 encounter 內容密度時維持現有存檔 shape，不因新增事件內容而要求 migration。

#### Scenario: 新事件只使用既有 event metadata
- **WHEN** 新增 v3 encounter event
- **THEN** 事件必須使用現有 `selector / presentation / choices / chain` metadata
- **AND** 不得新增 `EncounterState`、`PendingEncounter` 或 LocalStorage envelope 欄位

### Requirement: 終盤 v4 循環收束
系統必須 (MUST) 讓 `仙帝` 端 route-specific 內容、Workshop sink 與輪迴 route memory 形成可追蹤的終盤循環，而不是讓終盤只停在各自分散的事件、材料與重開入口。

#### Scenario: 三宗終盤 aftermath 產生 v4 記憶
- **WHEN** 玩家到達 `仙帝` 且已完成對應三宗 v3 world chapter 或終盤 route event
- **THEN** encounter catalog 必須提供對應 route 的 v4 aftermath 或 convergence event
- **AND** 該事件必須輸出可被後續 Workshop、輪迴或 source tracing 讀取的 `worldMemoryTags`
- **AND** 不得新增另一套 persisted endgame flag

#### Scenario: 終盤 Workshop sink 承接 route material
- **WHEN** 玩家取得 `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 等 route-specific material
- **THEN** Workshop 必須提供終盤 recipe 或等效 sink，把 route material 消耗接回可追蹤的 high-tier 產出
- **AND** recipe 必須保留最低境界、route tags、sourceHint 與材料需求
- **AND** 不得跳過 route-specific material cost

#### Scenario: 輪迴 reward 讀取 v4 endgame memory
- **WHEN** 玩家在本世完成 v4 endgame memory
- **THEN** 輪迴 planner 必須能用既有 `soul.worldMemoryTags` 解鎖或強化下一世 route reward
- **AND** reward 必須顯示 build identity、route source 與預期收益
- **AND** 不得為相同記憶新增第二套 unlock state

### Requirement: 終盤路線 v5 閉環
系統必須 (MUST) 讓 `sect:*:endgame-loop-v4` 不只解鎖單次魂印或單一 Workshop sink，而能延伸成可重複事件、職業向終盤 recipe、地圖本地線索與下一世 build cue。

#### Scenario: v5 aftermath 讀取 v4 終盤記憶
- **WHEN** 玩家已取得 `sect:sword:endgame-loop-v4`、`sect:beast:endgame-loop-v4` 或 `sect:mystic:endgame-loop-v4`
- **THEN** encounter catalog 必須提供對應宗門的 repeatable v5 aftermath event
- **AND** 缺少對應 endgame memory 時不得出現該 event
- **AND** v5 aftermath 不得使用 `once_per_run`

#### Scenario: v5 Workshop follow-up 承接終盤材料
- **WHEN** 玩家查看終盤 high-tier Workshop recipe
- **THEN** 每條 v5 職業向 recipe 必須消耗 `emperor_crown` 與對應 route material
- **AND** 必須保留 `sect:*:endgame-loop-v4` route tag 與 sourceHint

#### Scenario: v5 map local clue 指向終盤閉環
- **WHEN** 玩家抵達 `歸墟裂界`
- **THEN** 地圖本地 NPC / quest 必須說明 v5 route rumor、終盤 Workshop clue 與下一世 build hook
- **AND** 不得新增第二套地圖事件 runtime

#### Scenario: v5 content audit 防資料漂移
- **WHEN** 新增 v5 encounter、recipe、NPC、quest 或 soul seal catalog
- **THEN** authoring audit 必須能檢查核心 id、item reference、quest/NPC reference 與 route memory tag coverage

### Requirement: 戰力估算提供可比較的威脅摘要
系統必須 (MUST) 從既有角色戰鬥屬性與妖獸 catalog 推導戰力數值，協助玩家比較自身與妖獸威脅，但不得把戰力取代正式戰鬥解析公式。

#### Scenario: 角色戰力由既有戰鬥屬性推導
- **WHEN** 系統需要顯示玩家戰力
- **THEN** 戰力必須由 `calculatePlayerStats` 推導出的 HP、MP、攻擊、防禦、速度、暴擊、閃避等屬性計算
- **AND** 裝備、靈根、職業與已學技能造成的屬性變化必須反映在戰力上
- **AND** 不得新增新的 persisted 戰力欄位作為資料真相

#### Scenario: 妖獸戰力保留 rank 與特招差異
- **WHEN** 系統需要顯示妖獸戰力
- **THEN** 戰力必須考慮妖獸 HP、攻擊、防禦、境界、小境界、rank 與特殊攻擊
- **AND** 同等基礎屬性下 Boss 戰力必須高於 Elite，Elite 必須高於 Common
- **AND** 具有特殊攻擊的妖獸不得和無特殊攻擊的同等妖獸顯示相同威脅摘要

### Requirement: HUD derived level 與戰力不改變戰鬥規則
系統必須 (MUST) 讓 Adventure HUD 顯示的 derived Lv、HP、MP 與戰力只作為玩家判讀資訊，不改變正式戰鬥 resolver、經驗、境界或存檔規則。

#### Scenario: HUD 資訊只讀既有資料
- **WHEN** HUD 顯示 Lv、HP、MP 或戰力
- **THEN** 系統必須從既有 `character`、`inventory.equipmentStats` 與 combat stats helper 推導
- **AND** 不得因 HUD 顯示而改變實際戰鬥傷害、修煉收益或突破規則

### Requirement: 核心非戰鬥屬性必須有可讀玩法效果
系統必須 (MUST) 讓悟性、福緣與魅力至少各自提供一個可被 UI 與 helper 讀取的 derived gameplay effect。

#### Scenario: 屬性效果由既有 attributes 推導
- **WHEN** 系統需要顯示或套用悟性、福緣、魅力效果
- **THEN** 必須從既有 `character.attributes` 推導修煉、突破、掉落、遭遇或商店互動加成
- **AND** 不得新增新的 persisted attribute effect state

### Requirement: Adventure 世界戰鬥必須追蹤玩家靈力 runtime
系統必須 (MUST) 在 Adventure 世界戰鬥中追蹤目前玩家靈力，讓主動術式消耗與補靈丹效果能形成閉環。

#### Scenario: 主動術式消耗靈力
- **WHEN** 玩家施放主動術式
- **THEN** 系統必須扣除對應靈力成本
- **AND** 靈力不足時必須阻擋施放，不得只靠 cooldown 或技能存在判斷

### Requirement: 突破必須提供災劫風險 preview
系統必須 (MUST) 在突破前推導成功率、災劫風險與準備提示，讓高境界突破不只是不可讀的機率按鈕。

#### Scenario: 高境界突破顯示風險
- **WHEN** 玩家接近高境界突破
- **THEN** 系統必須顯示天劫、心魔或反噬類風險提示
- **AND** 第一版不得新增 persisted 傷勢或心魔 state

### Requirement: NPC 態度與商店折扣必須可由既有資料推導
系統必須 (MUST) 從魅力、宗門身份、完成任務、world memory 與 persisted NPC / sect affinity 合併推導 NPC 態度與商店折扣。

#### Scenario: 商店價格套用合併後的折扣
- **WHEN** 玩家與商店 NPC 互動
- **THEN** 系統必須能推導折扣比例與來源文字
- **AND** deterministic 魅力 / 職業 / 宗門功績來源不得被 persisted affinity 取代
- **AND** persisted NPC / sect affinity 必須以增量方式影響態度與折扣

### Requirement: 終盤 route 必須有 v6 repeatable density
系統必須 (MUST) 讓已完成 `sect:*:endgame-loop-v4` 的三宗路線各自擁有 v6 repeatable aftermath。

#### Scenario: 三宗終盤 route 都有後續遭遇
- **WHEN** 玩家具備對應 `sect:*:endgame-loop-v4`
- **THEN** encounter selector 必須能選到該宗 v6 repeatable aftermath
- **AND** 每個事件必須提供 route、風險、收益與 memory cue

### Requirement: Workshop 終盤專精必須影響 endgame recipe cue
系統必須 (MUST) 讓 endgame specialization leaf 對終盤 recipe 顯示可讀影響，但不得跳過核心 route material。

#### Scenario: active specialization 影響終盤 recipe
- **WHEN** 玩家啟用 endgame specialization leaf 並查看對應 recipe
- **THEN** 系統必須顯示成本、熟練、品質或副產物 cue
- **AND** recipe 仍必須消耗對應 route material

### Requirement: v6 route 必須提供 Reincarnation build reward
系統必須 (MUST) 讓三宗 v6 route 各自提供可讀的輪迴魂印或 build reward，並從既有 route memory 或 resolved content 解鎖。

#### Scenario: v6 route 解鎖對應魂印
- **WHEN** 玩家完成對應三宗 v6 aftermath、Workshop clue 或 local route clue
- **THEN** Reincarnation reward 必須能推導對應 v6 魂印可用狀態
- **AND** 鎖定狀態必須提供缺少的 route memory 或 clue 說明

### Requirement: 終盤 route 必須提供 v7 repeatable aftermath
系統必須 (MUST) 讓已完成 `sect:*:endgame-loop-v4` 的三宗路線各自擁有 v7 repeatable aftermath。

#### Scenario: 三宗 v7 aftermath 可被 encounter selector 選到
- **WHEN** 玩家具備對應 `sect:*:endgame-loop-v4`
- **THEN** encounter selector 必須能選到該宗 v7 repeatable aftermath
- **AND** 每個 v7 事件必須提供 route、風險、收益與 memory cue

### Requirement: 突破失敗必須能產生持續性災劫後果
系統必須 (MUST) 在高境界突破失敗時能產生可恢復的心魔、傷勢或反噬 consequence，並影響後續突破或修行風險。

#### Scenario: 高境界突破失敗套用 consequence
- **WHEN** 玩家在高境界突破失敗且風險判定觸發
- **THEN** 系統必須記錄對應 consequence 類型、嚴重度與剩餘持續時間或恢復條件
- **AND** 後續 preview 必須能讀取該 consequence 並反映風險或準備提示

### Requirement: NPC / sect 好感必須可持續累積
系統必須 (MUST) 記錄玩家與 NPC 或 sect 的長期 affinity，並讓任務、對話、商店或 route memory 能調整該值。

#### Scenario: 玩家行為調整 affinity
- **WHEN** 玩家完成會影響 NPC 或 sect 的任務、對話或商店互動
- **THEN** 系統必須調整對應 affinity state
- **AND** deterministic 魅力 / 職業 baseline 必須保留為額外來源，不得被 persisted affinity 完全取代

### Requirement: 戰鬥主動功法必須可由玩家裝備
系統必須 (MUST) 讓玩家從已學主動功法中選擇戰鬥使用的主動功法，並在戰鬥選招時優先使用該功法。

#### Scenario: 玩家裝備已學主動功法
- **WHEN** 玩家已學多個主動功法並選擇其中一個作為裝備功法
- **THEN** 戰鬥選招必須優先使用該裝備功法
- **AND** 若裝備功法不存在、未學、非主動或職業不符，必須 fallback 到既有最高階主動功法選擇

### Requirement: 初階功法必須有正式藏經閣取得入口
系統必須 (MUST) 讓初階與宗門基礎功法可透過正式 NPC / shop 入口取得，並保留任務、怪物掉落與傳承作為其他功法來源。

#### Scenario: 玩家尋找初階功法
- **WHEN** 玩家在凡界或宗門尋找基礎功法
- **THEN** 地圖必須提供藏經閣類 NPC 連到對應功法商店
- **AND** 圖鑑只作為來源查詢，不得被視為購買或裝備入口

### Requirement: 參悟功法後必須銜接戰鬥裝備
系統必須 (MUST) 在玩家參悟主動功法後，引導玩家將該功法設為戰鬥裝備，而不是只把技能加入已學清單。

#### Scenario: 玩家在背包參悟主動功法
- **WHEN** 玩家成功使用帶有 `learn_skill` effect 的功法秘卷
- **THEN** 系統必須把功法加入已學技能
- **AND** 成功提示必須指出可到功法面板裝備主動術式參戰

### Requirement: 初期主線必須串接功法取得 loop
遊戲資料必須 (MUST) 提供一條早期主線，讓玩家在入門前知道可透過藏經閣取得功法秘卷，並在背包參悟後到功法面板裝備。

#### Scenario: 玩家接觸藏經閣主線
- **WHEN** 玩家向藏經閣 NPC 接取早期主線
- **THEN** 任務對話必須說明秘卷購買、背包參悟與功法裝備
- **AND** 任務完成不得新增 persisted schema

