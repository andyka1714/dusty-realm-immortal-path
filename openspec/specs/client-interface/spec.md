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
