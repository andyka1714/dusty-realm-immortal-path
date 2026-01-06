# game-mechanics Specification

## Purpose
TBD - created by archiving change document-core-architecture. Update Purpose after archive.
## Requirements
### Requirement: 遊戲初始化流程 (Game Initialization)
系統必須 (MUST) 引導玩家完成角色創建與靈根覺醒。

#### Scenario: 序幕與身份
- **WHEN** 首次進入遊戲
- **THEN** 顯示打字機效果的序幕劇情 (大荒曆...)
- **AND** 顯示姓名輸入框與性別選擇 (男/女)

#### Scenario: 靈根覺醒 (Gacha)
- **WHEN** 玩家點擊感靈石
- **THEN** 播放震動與閃光特效
- **AND** 根據機率抽取靈根：雜靈根(70%), 真靈根(20%), 天靈根(8%), 變異靈根(2%)
- **AND** 生成初始六維屬性：
  - 基礎各 10 點 (總和 60)
  - 根據靈根追加點數 (雜+10, 真+20, 天/變+30)
  - 隨機分配至上限 20 點

### Requirement: 修煉系統 (Cultivation System)
系統必須 (MUST) 允許角色累積經驗值並突破境界。

#### Scenario: 經驗值獲取公式
- **WHEN** 遊戲 Tick 觸發 (1秒)
- **THEN** 獲得修為 = `基礎速率(1.0) * 境界倍率 * 靈根倍率 * (1 + 根骨%)`
- **AND** 境界倍率：練氣(3x), 築基(8x), 金丹(25x), 元嬰(100x)...
- **AND** 靈根倍率：天(2.5x), 變異(2.0x), 真(1.5x), 雜(1.0x)

#### Scenario: 境界經驗上限公式
- **WHEN** 計算當前境界最大修為
- **THEN** 公式為 `Base * (Growth ^ MinorRealm)`
- **AND** 範例：練氣 Base=1000, Draw=1.25

#### Scenario: 境界突破 (Breakthrough)
- **WHEN** 經驗值滿且點擊突破
- **THEN** 執行成功率檢定：`Rate = (Base * Decay) + (悟性 * 0.2%) + (福緣 * 0.1%) + 道具`
- **AND** 若失敗 (一般/小境界)：扣除 **30%** 當前修為
- **AND** 若失敗 (雷劫)：扣除 **100%** 當前修為 (修為歸零)

### Requirement: 背包與物品 (Inventory & Items)
系統必須 (MUST) 管理物品、裝備及製作材料。

#### Scenario: 物品類型定義
- **WHEN** 處理物品資料
- **THEN** 支援：weapon(兵), armor(甲), pill(丹), material(材), manual(書), breakthrough(引)

#### Scenario: 裝備屬性計算
- **WHEN** 玩家裝備物品
- **THEN** 系統計算 `equipmentStats` 並累加至角色屬性

### Requirement: 冒險與戰鬥 (Adventure & Combat)
系統必須 (MUST) 提供網格地圖探索與回合制戰鬥。

#### Scenario: 地圖機制
- **WHEN** 進入地圖
- **THEN** 根據 `MAPS` 資料生成網格 (Block-based Design)
- **AND** 生成怪物：普通怪根據地形名稱生成 (林->狼, 谷->蜂, 湖->鬼, 火->蟻)
- **AND** 生成 Boss：固定座標生成，掉落突破道具

#### Scenario: 戰鬥公式
- **WHEN** 發生戰鬥
- **THEN** `ATK = Base + (根骨*2) + Equip`
- **AND** `DEF = Base + (體魄*1) + Equip`
- **AND** `Damage = (ATK * Rand(0.9~1.1)) - (DEF * 0.5)`
- **AND** 暴擊機率 = `神識 * 0.1%`, 閃避機率 = `福緣 * 0.1%`

