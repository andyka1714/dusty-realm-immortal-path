## MODIFIED Requirements

### Requirement: 圖鑑分類與瀏覽可讀性
介面必須 (MUST) 讓 `萬界圖鑑` 的物品、功法與宗門資料以可掃描的分類與來源追蹤方式呈現，而不是只把所有資料平鋪在同一個長頁中。

#### Scenario: 神兵法寶標題不得遮住物品卡
- **WHEN** 玩家在 desktop 或 mobile viewport 開啟 `神兵法寶`
- **THEN** tab heading、sticky header 或 scroll container 不得覆蓋第一張可見物品卡
- **AND** 玩家必須能在同一個 scroll container 內看到境界標題、item card 與來源追蹤 chips

#### Scenario: 功法神通按職業與境界瀏覽
- **WHEN** 玩家開啟 `功法神通`
- **THEN** 介面必須提供 `通用 / 劍修 / 體修 / 法修` 等職業或通用分類
- **AND** 每個分類內必須依境界分組或提供等效境界摘要
- **AND** 每張功法卡仍必須顯示秘卷來源、formal source tier 與職業 / 境界資訊

#### Scenario: 神兵法寶顯示來源追蹤
- **WHEN** 圖鑑顯示正式 item catalog
- **THEN** 圖鑑必須顯示可讀來源，例如商店、敵人掉落、Workshop 產物、Workshop sink、encounter 或宗門章節
- **AND** route-specific material 必須顯示對應宗門、world memory tag 或 encounter cue

#### Scenario: 功法神通顯示秘卷來源
- **WHEN** 圖鑑顯示正式 core skill
- **THEN** 介面必須能顯示對應 manual source labels
- **AND** 不得要求玩家從 internal skill id 推測技能來源

#### Scenario: 宗門傳承以單宗聚焦瀏覽
- **WHEN** 玩家開啟 `宗門傳承`
- **THEN** 介面必須提供可切換的宗門 tabs 或等效單宗聚焦控制
- **AND** 同一時間應聚焦顯示單一宗門的人物、傳承功法與章節線索

#### Scenario: 宗門傳承顯示 v3 / v4 route source summary
- **WHEN** 玩家查看單一宗門頁
- **THEN** 介面必須顯示該宗門對應的 route material、`sect:*:world-chapter-03` world memory tag、`sect:*:endgame-loop-v4` endgame memory tag 與用途摘要
- **AND** 該摘要必須連到 encounter、Workshop 或 Reincarnation hook 的可讀 cue
- **AND** 不得只顯示宗門 flavor text 而沒有可操作的來源 / 用途線索
