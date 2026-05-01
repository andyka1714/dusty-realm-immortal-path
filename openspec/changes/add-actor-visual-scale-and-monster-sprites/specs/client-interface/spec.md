## ADDED Requirements

### Requirement: Actor 視覺比例必須以玩家為基準
正式 Adventure 場景必須 (MUST) 以玩家角色的 `1x2` 視覺比例作為 actor scale 基準，讓玩家、NPC、普通怪、精英怪與 Boss 的相對大小可被一致判讀。

#### Scenario: 玩家比例作為怪物尺寸參考
- **WHEN** 系統解析怪物或 NPC 的視覺尺寸
- **THEN** 玩家角色必須被視為寬約 1 tile、高約 2 tile 的基準 actor
- **AND** 怪物的 `heightTiles` 與 `footprintTiles` 必須能相對玩家比例解釋
- **AND** 目前 96px player sheet 的 `1x2` 基準高度必須以實測約 `80px` actor 高度與約 `y=89` 腳底線作為 humanoid QC 參考

#### Scenario: 不同 actor 共用腳底錨點
- **WHEN** 玩家、NPC 或怪物出現在同一張地圖
- **THEN** actor 本體必須使用腳底或接地底線作為 depth sorting anchor
- **AND** 下方 actor 必須能覆蓋上方 actor，不得因玩家或怪物 layer 固定順序而錯誤遮擋

### Requirement: 怪物圖樣必須支援不同體型與 render 尺寸
正式 Adventure 場景必須 (MUST) 允許怪物依其設計顯示不同寬度、高度與體型，而不是所有怪物都被壓成單格文字 token 或同一大小 humanoid sprite。

#### Scenario: 伏地怪以橫向比例呈現
- **WHEN** 怪物 visual profile 顯示其 body type 為低伏、甲殼、四足或長條怪
- **THEN** render 必須支援寬大於高的 footprint
- **AND** 該怪物仍必須用接地底線參與 depth sorting

#### Scenario: 高大型怪物以高於玩家的比例呈現
- **WHEN** 怪物 visual profile 顯示其 body type 為巨人、石像、高大精英或 Boss 法相
- **THEN** render 必須支援高於玩家的 `heightTiles`
- **AND** 不得為了維持單格 token 而把高大型怪物壓回玩家同高

#### Scenario: Boss 尺寸依描述而非 rank 固定套用
- **WHEN** 系統顯示 Boss 怪物
- **THEN** Boss 的 render footprint 與 height 必須依名稱、描述、body type 與場景語境判定
- **AND** 不得只因 `EnemyRank.Boss` 就套用同一個固定尺寸

### Requirement: 怪物必須具備四方向移動與四方向戰鬥圖樣
每個標記為 production-ready sprite 的怪物都必須 (MUST) 具備上、下、左、右方向的移動與戰鬥圖樣，而不是只具備單方向 idle 或文字 token。

#### Scenario: 怪物移動圖樣涵蓋四方向
- **WHEN** 怪物在 Adventure 場景中移動
- **THEN** 系統必須能依移動方向選擇上、下、左、右對應 movement frame
- **AND** movement animation 每個方向列必須遵循第 1、3 格站定 / 重心，第 2、4 格左右腳或對應肢體交替的步態
- **AND** 不得讓同一方向列出現連續相同或同側邁步的圖示

#### Scenario: 怪物戰鬥圖樣涵蓋四方向
- **WHEN** 怪物對玩家發動普攻、特招或施法
- **THEN** 系統必須能依面向選擇上、下、左、右對應 combat frame
- **AND** combat animation 必須依 body type 呈現合理攻擊姿態，而不是所有怪物共用同一種揮擊

#### Scenario: 未完成怪物使用明確 fallback
- **WHEN** 某怪物尚未完成 movement 或 combat 任一 asset
- **THEN** 系統可以暫時回退到現有 token 顯示
- **AND** 該怪物不得被標記為 production-ready sprite

#### Scenario: 每隻怪物都有獨立圖檔資料夾
- **WHEN** 某怪物完成 `$generate2dsprite` 圖樣生成
- **THEN** movement 與 combat 必須分別輸出到該 enemy id 專屬資料夾
- **AND** 不得把另一隻怪物的完成圖檔直接登錄為此怪物的 production-ready asset

#### Scenario: Movement 與 combat 風格一致
- **WHEN** 同一 enemy 的 movement 與 combat sheet 都已產出
- **THEN** 兩套圖樣必須保留同一 silhouette、palette、outline、scale、view angle 與 footline
- **AND** 兩套圖樣必須使用相同 normalized frame size，預設不得出現 movement 為 96px frame、combat 為 128px frame 的混用
- **AND** 同一 enemy 的 movement / combat 平均 actor 高度差距不得超過 4%，腳底線差距不得超過 1px
- **AND** 不得出現 movement 與 combat 像不同怪物、不同畫風或不同 rank 特效的情況
- **AND** 若 pair style QC 未通過，該 enemy 不得標記為 production-ready

#### Scenario: 人形怪物使用 NPC 修長比例
- **WHEN** 怪物 body type 為 humanoid
- **THEN** movement 與 combat 圖樣必須參考 NPC / player 的修長身形比例
- **AND** 普通 `1x2` 人形怪物在 96px frame 內的 actor 高度應接近 player 的 80px 基準
- **AND** 不得生成大頭版、寬短版、矮胖版或 combat 明顯放大 / 縮小的 humanoid 角色

### Requirement: 怪物名稱與戰鬥提示不得破壞大型 sprite 可讀性
介面必須 (MUST) 讓怪物 sprite、血條、target marker、危險區與 Boss telegraph 同時可讀。

#### Scenario: 大型怪物上方提示維持可讀
- **WHEN** 大型怪物被鎖定或進入戰鬥
- **THEN** 血條、target marker 與必要提示必須跟隨怪物視覺尺寸定位
- **AND** 不得固定在單格中心導致提示壓在怪物身體內或偏離目標

#### Scenario: 大型 Boss 不遮蔽關鍵 UI
- **WHEN** Boss sprite 高度或寬度明顯大於玩家
- **THEN** camera framing、透明度、輪廓或 overlay 必須維持玩家與戰鬥 cue 可讀
- **AND** 不得讓 Boss 圖樣永久遮住玩家操作或 HUD 重要資訊

### Requirement: 普通怪、精英怪與首領必須有可辨識視覺差異
正式 Adventure 場景必須 (MUST) 讓玩家能在不打開詳情的情況下辨識普通怪、精英怪與首領差異。

#### Scenario: 普通怪維持低干擾
- **WHEN** 普通怪出現在地圖或戰鬥中
- **THEN** 其 sprite、輪廓與動畫必須清楚但低干擾
- **AND** 不得使用與精英或 Boss 相同強度的 aura、telegraph 或 target cue

#### Scenario: 精英怪具備中等強度辨識
- **WHEN** 精英怪出現在地圖或戰鬥中
- **THEN** 介面必須以外輪廓、元素邊光、粒子、血條樣式或攻擊前饋標示其高於普通怪的威脅
- **AND** 不得只靠名稱或血量差異讓玩家辨識

#### Scenario: 首領具備最高層級場上存在感
- **WHEN** Boss 出現在地圖或戰鬥中
- **THEN** 介面必須提供專屬 target marker、血條或 telegraph 語言
- **AND** Boss 的 aura、ground ring、shadow、法相或領域特效必須明顯高於精英怪
- **AND** 這些效果不得遮蔽玩家操作與核心 HUD
