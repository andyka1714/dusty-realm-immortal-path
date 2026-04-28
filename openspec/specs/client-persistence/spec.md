# client-persistence Specification

## Purpose
定義目前正式使用的 LocalStorage 存檔結構、離線收益規則與輪迴相關 schema migration。
## Requirements
### Requirement: 版本化存檔封裝 (Versioned Save Envelope)
系統必須 (MUST) 以版本化存檔封裝在 LocalStorage 中儲存 current run 與 soul progression，而不是只存單層 Redux root state。

#### Scenario: 序列化 current 與 soul
- **WHEN** 系統序列化存檔
- **THEN** 存檔物件必須包含 `schemaVersion`
- **AND** 必須包含 `current` 區塊，承接 `character / logs / adventure / inventory / workshop / quest / encounter`
- **AND** 必須包含 `soul` 區塊，承接功德、Lifetime Stats、魂印解鎖、遺珍倉庫與輪迴暫存資訊

#### Scenario: 輪迴僅重置 current run
- **WHEN** 玩家完成輪迴並開始新一世
- **THEN** 存檔必須重建新的 `current` 區塊
- **AND** 同一份存檔內的 `soul` 區塊必須保留並寫入最新功德、魂印與遺珍狀態
- **AND** 不得把上一世的 `adventure / inventory / workshop / quest / encounter` 狀態殘留到新一世

### Requirement: 存檔版本遷移 (Save Schema Migration)
系統必須 (MUST) 能將 legacy LocalStorage 存檔與 retired skill/manual 資料遷移到正式版本化 schema。

#### Scenario: 載入 legacy raw save
- **WHEN** LocalStorage 中仍是舊版 raw root state
- **THEN** 系統必須將其視為 legacy current run
- **AND** 自動補上預設 `soul` state、預設 `encounter` state 與新版 schemaVersion
- **AND** 不得因缺少新版欄位而讓遊戲無法讀檔

#### Scenario: retired skill 與 manual 正式遷移
- **WHEN** 舊存檔內仍含 retired skill id、legacy manual item id 或 manual-like 無效殘值
- **THEN** 系統必須將可映射項目正規化到 formal core skill / manual id
- **AND** 對無法映射的 manual-like 殘值必須安全丟棄
- **AND** 不得把 retired skill 或壞掉的 manual id 直接帶進新版 current run

#### Scenario: encounter hydration 與保存
- **WHEN** 存檔中包含 `encounter.pendingEvent` 或 `resolvedEventIds`
- **THEN** 系統必須只接受合法 shape 的 pending event 與已解決事件清單
- **AND** 後續保存必須繼續使用正式 versioned envelope，而不是退回 legacy shape

### Requirement: 離線收益計算 (Offline Logic)
系統必須 (MUST) 在讀取存檔時計算 current run 的離線收益，且不得對 soul-only 狀態錯誤發放修為。

#### Scenario: 有 active current run
- **WHEN** 載入包含有效 current run 的存檔
- **THEN** 系統仍依 `current.character.lastSaveTime` 計算離線收益
- **AND** 離線收益只作用於 current run

#### Scenario: 處於輪迴流程中
- **WHEN** 玩家處於死亡總結或輪迴大殿、尚未開始新一世
- **THEN** 系統不得對尚未建立的新 current run 發放修為

### Requirement: 支撐型養成與事件狀態持久化
系統必須 (MUST) 持久化 Workshop 與 event loop 所需的當世狀態，避免重新整理後遺失進度。

#### Scenario: Workshop current run 狀態保存
- **WHEN** 玩家更新聚靈陣、煉丹、煉器或 recipe 進度
- **THEN** 對應的 Workshop state 必須保存於 current run
- **AND** 重新載入後不得丟失當世百業進度

#### Scenario: event 流程狀態保存
- **WHEN** 玩家正處於待處理的 event / encounter 流程
- **THEN** 系統必須保存必要的事件上下文與可恢復狀態
- **AND** 不得因重新載入而跳過、重複或破壞該次事件結果

### Requirement: 舊存檔技能資料遷移
系統必須 (MUST) 在載入舊存檔時，把 `transition / legacy` 技能與秘卷引用遷移為 formal core 視角，再交給 Redux store 使用。

#### Scenario: 載入舊存檔時正規化角色技能
- **WHEN** 應用程式從 LocalStorage 載入舊存檔
- **THEN** `character.skills` 中的 retired skill id 必須在 hydrate 前映射為 formal core replacement
- **AND** hydrate 後的 `character.skills` 不得再保留 retired skill id

#### Scenario: 載入舊存檔時升級舊秘卷物品
- **WHEN** 舊存檔背包中仍包含 retired 技能秘卷
- **THEN** 系統必須把該 item 轉成對應的正式秘卷 item
- **AND** 若找不到有效的正式秘卷對應，該 retired item 不得以壞資料形式繼續進入 store

#### Scenario: 遷移流程必須可重複執行而不污染存檔
- **WHEN** 同一份已遷移過的存檔再次被載入
- **THEN** 遷移流程必須維持相同結果
- **AND** 不得重複插入技能、重複生成秘卷或把 formal core skill 再次改寫成其他 id

### Requirement: 高階 Workshop 狀態遷移
系統必須 (MUST) 讓新增的 Workshop mastery、specialization 或 high-tier recipe 狀態安全寫入 current run，並能從舊存檔補齊預設值。

#### Scenario: 新版存檔保留高階百業進度
- **WHEN** 玩家完成高階 recipe、累積 mastery 或設定百業專精
- **THEN** 存檔的 `current.workshop` 必須保留對應進度
- **AND** 重新載入後不得遺失已解鎖 recipe、craft counts、mastery 或 specialization

#### Scenario: legacy workshop state 補齊新欄位
- **WHEN** 舊存檔的 `current.workshop` 只有 `alchemyLevel / blacksmithLevel / unlockedRecipes / craftedRecipeCounts`
- **THEN** migration 必須補上 high-tier workshop 所需的新欄位預設值
- **AND** 不得因欄位缺失讓讀檔、輪迴或 Workshop UI 崩潰

### Requirement: 輪迴 planner 演進式存檔承接
系統必須 (MUST) 讓既有 `soul` save 能安全承接擴充後的 planner catalog，而不是因第二批 perk / 遺珍規則而失效。

#### Scenario: 舊版 soul save 載入新版 planner
- **WHEN** 玩家載入尚未包含新版 planner 欄位或進階 perk catalog 的舊存檔
- **THEN** 系統必須自動補上 baseline planner 預設值與可用 perk 狀態
- **AND** 不得因缺少新版欄位而無法讀檔

#### Scenario: 清理過期或超限選擇
- **WHEN** 舊存檔內的 `rebirthConfig` 與新版 slot / perk 規則不相容
- **THEN** 系統必須保留仍合法的選擇並清理超限項目
- **AND** 不得讓無效 planner 配置直接進入下一世

### Requirement: Workshop 專精樹存檔遷移
系統必須 (MUST) 將舊版 Workshop 專精欄位安全遷移到專精樹 state，不得破壞既有 current run。

#### Scenario: 舊存檔缺少專精樹 state
- **WHEN** 載入只有扁平 `specializationByDiscipline` 或缺少專精欄位的舊存檔
- **THEN** migration 必須補上合法的專精樹預設 state
- **AND** 若舊存檔已有可相容的 active specialization，必須盡可能保留其效果或映射到對應節點

### Requirement: 事件鏈與世界記憶持久化
系統必須 (MUST) 在 current run 中安全保存 encounter chain 與 world memory state，並能從舊存檔補齊預設值。

#### Scenario: 舊存檔補齊事件記憶 state
- **WHEN** 載入尚未包含 world memory 欄位的舊存檔
- **THEN** migration 必須補上合法預設值
- **AND** 不得破壞既有 pending encounter 或 resolved event ids

#### Scenario: 無效記憶資料被清理
- **WHEN** 存檔包含 shape 不合法的 chain 或 memory payload
- **THEN** hydration 必須安全清理或忽略該資料
- **AND** 不得因此讓遊戲無法讀檔

### Requirement: Workshop v2 state 相容 gate
系統必須 (MUST) 在 Workshop v2 / v3 變更中明確判斷是否需要新增 persisted state，若新增則必須提供 migration。

#### Scenario: 不新增 state 時維持舊存檔相容
- **WHEN** Workshop v2 或 v3 只擴 recipe、tree definition、mastery milestone、source cue、route memory cue 或 UI cue
- **THEN** 舊存檔必須能沿用現有 Workshop state 正常載入
- **AND** 不得要求新 migration 才能使用既有 current run

#### Scenario: 新增 persisted state 時補 migration
- **WHEN** Workshop v2 或 v3 新增 recipe provenance、craft queue、mastery history 或 route unlock 等 persisted field
- **THEN** migration 必須為舊存檔補上合法預設值
- **AND** 必須有 regression 防止讀檔崩潰

#### Scenario: v3 route memory 只讀既有 soul world memory
- **WHEN** Workshop v3 需要判斷三宗 v3 route chapter 是否完成
- **THEN** 系統必須讀取既有 `soul.worldMemoryTags`、recipe metadata 與 Workshop mastery / specialization state
- **AND** 不得為相同事實新增重複的 Workshop persisted field

### Requirement: 輪迴 build diversity 存檔承接
系統必須 (MUST) 讓舊版 soul save 能安全載入輪迴 v2 catalog，並清理不合法 planner 配置。

#### Scenario: 舊 soul save 載入 v2 catalog
- **WHEN** 玩家載入不含 v2 perk、魂印或 planner 欄位的舊存檔
- **THEN** migration 必須補上合法預設值
- **AND** 不得讓 Reincarnation Hall 因欄位缺失崩潰

#### Scenario: 不合法配置被清理
- **WHEN** 舊存檔內的 rebirth config 不符合 v2 slot、互斥或 cost 規則
- **THEN** 系統必須保留合法選擇並清理不合法項目
- **AND** 不得允許非法配置開始新一世

#### Scenario: v3 route-memory 本命魂印不新增 persisted schema
- **WHEN** 輪迴 v3 catalog 新增讀取 `sect:*:world-chapter-03` 的本命魂印
- **THEN** 舊存檔必須沿用既有 `soul.worldMemoryTags` 與 `rebirthConfig` 判斷可用性與 selected seal sanitize
- **AND** 不得新增新的 `soul` 欄位、current run 欄位或 LocalStorage envelope 欄位
- **AND** 不需要 migration 或 hydrate sanitize，只需沿用既有 planner sanitize 清理不可用 `selectedSealId`

### Requirement: Persistence migration release gate
系統必須 (MUST) 在任何改動 persisted state 的正式 change 中定義 migration、hydration 與 regression gate。

#### Scenario: Change 新增 persisted state
- **WHEN** 新功能新增 current run、soul、encounter、workshop 或其他 LocalStorage 欄位
- **THEN** 該 change 必須提供舊存檔預設值補齊或清理策略
- **AND** 必須有 regression 證明舊存檔不會因缺欄位崩潰

#### Scenario: Change 不新增 persisted state
- **WHEN** 新功能只改資料表、UI cue 或 deterministic helper
- **THEN** tasks 必須明確記錄不需要 migration 的理由
- **AND** 不得在未宣告的情況下偷渡新 persisted field

#### Scenario: Reincarnation route memory v3 不新增 persisted state
- **WHEN** Reincarnation route memory v3 只新增本命魂印 catalog、planner gate 或 UI cue
- **THEN** 系統必須沿用既有 `soul.worldMemoryTags` 與 `rebirthConfig`
- **AND** 不需要新增 migration 或 LocalStorage hydration 邏輯

#### Scenario: Compendium source tracing v2 不新增 persisted state
- **WHEN** 圖鑑來源追蹤只從既有 catalog、drop table、shop、Workshop recipe、encounter reward 或 skill manual metadata 推導
- **THEN** 系統必須沿用既有 item / skill / quest id 與 LocalStorage envelope
- **AND** 不得新增新的 persisted source registry、玩家圖鑑進度欄位或 hydrate migration

#### Scenario: Pixel map visual QA v3 不新增 persisted state
- **WHEN** pixel map visual QA v3 只新增 terrain QA helper、regression、Playwright smoke 或文件
- **THEN** 系統必須沿用既有 map metadata、Adventure runtime 與 LocalStorage envelope
- **AND** 不得新增新的 persisted map visual state、actor sprite state 或 hydrate migration

#### Scenario: Encounter aftermath v3 不新增 persisted state
- **WHEN** encounter aftermath v3 只新增 catalog event、selector gate、presentation cue 或 choice reward
- **THEN** 系統必須沿用既有 `soul.worldMemoryTags` 與 `resolvedEventIds`
- **AND** 不需要新增 migration 或 hydration sanitize

### Requirement: Build budget 不新增 persisted state
系統必須 (MUST) 讓 build budget 與 lazy-loading 調整不改變存檔格式。

#### Scenario: Build / lazy boundary 調整不需要 migration
- **WHEN** 專案調整 Vite chunk budget、manual chunks 或 query-gated lazy import
- **THEN** 既有 LocalStorage 存檔必須不需要 migration 或 hydrate sanitize
- **AND** 不得新增 persisted field、LocalStorage key 或存檔版本分支

### Requirement: Content audit tools 不新增 persisted state
系統必須 (MUST) 讓 authoring audit 維持為 deterministic test/helper，不改變玩家存檔格式。

#### Scenario: Audit helper 不需要 migration
- **WHEN** 專案新增 content audit helper 或 regression
- **THEN** 既有 LocalStorage 存檔必須不需要 migration 或 hydrate sanitize
- **AND** 不得新增 runtime persisted field、LocalStorage key 或存檔版本分支

### Requirement: 終盤 v4 不新增 persisted schema
系統必須 (MUST) 讓終盤 v4 的 encounter chain、Workshop sink、輪迴 reward 與 UI cue 沿用既有 persisted shape，避免為短期內容串接新增 migration 負擔。

#### Scenario: v4 記憶沿用既有世界記憶
- **WHEN** v4 encounter 或輪迴 reward 需要保存終盤結果
- **THEN** 系統必須使用既有 `soul.worldMemoryTags`、`resolvedEventIds`、inventory、Workshop state 或 rebirth config
- **AND** 不得新增 LocalStorage envelope 欄位、`current` 子樹或新的 hydrate schema

#### Scenario: v4 catalog 擴量不需要 migration
- **WHEN** 新增 v4 encounter、recipe、item 或 reincarnation reward catalog entry
- **THEN** 舊存檔必須能透過既有 migration / sanitize path 正常載入
- **AND** 若沒有新增 persisted shape，tasks 與 tracking docs 必須明確記錄不需要 migration 的理由

### Requirement: 圖鑑瀏覽整理不新增 persisted state
系統必須 (MUST) 讓 Compendium v4 的分類、tabs、source summary 與 layout 修正只從既有 catalog 推導，避免為瀏覽體驗新增存檔負擔。

#### Scenario: Compendium route browsing v4 不新增 schema
- **WHEN** 圖鑑顯示職業 tabs、境界摘要、宗門 route hook summary 或 item source tracing
- **THEN** 系統必須從既有 `ITEMS`、skill registry、sect config、encounter metadata、Workshop recipes 與 source tracing helper 推導
- **AND** 不得新增 LocalStorage envelope 欄位、玩家圖鑑進度欄位或新的 persisted source registry

### Requirement: 補給經濟 v4 不新增 persisted state
系統必須 (MUST) 讓補給品商店、恢復品 runtime 與 UI effect 文案只讀既有 item、inventory、character 與 adventure runtime state，避免為短期補給流程新增存檔負擔。

#### Scenario: 補給 v4 不新增 schema
- **WHEN** 系統顯示商店補給、背包補給、戰鬥快捷補給或恢復品不可用原因
- **THEN** 必須使用既有 `ITEMS`、`SHOPS`、inventory slots、character state 與當前可見 combat runtime resources
- **AND** 不得新增 LocalStorage envelope 欄位、補給使用 persisted queue 或新的 hydrated combat resource 欄位

### Requirement: 技能書 routing v4 不新增 persisted state
系統必須 (MUST) 讓技能書商店、掉落與圖鑑 route 只從既有 catalog 推導，避免為 source tracing 新增玩家存檔負擔。

#### Scenario: 技能書 routing 不新增 schema
- **WHEN** 系統建立 manual routing helper 或圖鑑 skill source trace
- **THEN** 必須使用既有 skill metadata、`SHOPS`、`BESTIARY`、manual item id 與 source labels
- **AND** 不得新增 LocalStorage envelope 欄位、玩家技能書來源進度或新的 persisted route registry

### Requirement: 終盤路線 v5 不新增 persisted state
系統必須 (MUST) 讓 v5 route aftermath、Workshop follow-up、map-local clue、reincarnation seal 與 audit 只讀既有 catalog 與 world memory，不新增 LocalStorage schema。

#### Scenario: v5 使用既有記憶與 catalog
- **WHEN** v5 encounter selector、Workshop recipe、map-local quest 或 soul seal 判斷解鎖條件
- **THEN** 必須使用既有 `resolvedEventIds`、`soul.worldMemoryTags`、static item/recipe/NPC/quest catalog
- **AND** 不得新增 envelope 欄位、hydration migration、玩家圖鑑進度或 persisted source registry
