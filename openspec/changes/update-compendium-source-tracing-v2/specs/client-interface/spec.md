## MODIFIED Requirements

### Requirement: 圖鑑分類與瀏覽可讀性
介面必須 (MUST) 讓 `萬界圖鑑` 的物品、功法與宗門資料以可掃描的分類與來源追蹤方式呈現，而不是只把所有資料平鋪在同一個長頁中。

#### Scenario: 神兵法寶標題不得遮住物品卡
- **WHEN** 玩家在 desktop 或 mobile viewport 開啟 `神兵法寶`
- **THEN** 境界或分類標題不得覆蓋第一排物品卡片
- **AND** 玩家必須能在不猜測 scroll offset 的情況下讀到每個 section 的第一個物品

#### Scenario: 神兵法寶顯示來源追蹤
- **WHEN** 玩家查看物品、材料或秘卷卡片
- **THEN** 圖鑑必須顯示可讀來源，例如商店、敵人掉落、Workshop 產物、Workshop sink、encounter 或宗門章節
- **AND** route-specific material 必須顯示對應宗門、world memory tag 或 encounter cue

#### Scenario: 功法神通按職業與境界瀏覽
- **WHEN** 玩家開啟 `功法神通`
- **THEN** 介面必須提供 `通用 / 劍修 / 體修 / 法修` 或等效 profession filter
- **AND** 每個 profession view 必須能按境界分組或過濾
- **AND** 不得只用全量卡片平鋪要求玩家逐張辨識職業與境界

#### Scenario: 功法神通顯示秘卷來源
- **WHEN** 玩家查看正式 core skill
- **THEN** skill card 必須顯示 formal source tier 與秘卷來源 labels
- **AND** 不得要求玩家只靠內部 `formalSourceTier` 推測取得方式

#### Scenario: 宗門傳承以單宗聚焦瀏覽
- **WHEN** 玩家開啟 `宗門傳承`
- **THEN** 介面必須讓玩家切換 `凌霄劍宗 / 萬獸山莊 / 縹緲仙宮` 或等效 sect filter
- **AND** 同一時間應聚焦顯示單一宗門的人物、傳承功法與章節線索
- **AND** mobile viewport 不得因三宗內容一次展開而造成難以掃描的超長頁

#### Scenario: 宗門傳承顯示 v3 route source summary
- **WHEN** 玩家查看單一宗門頁
- **THEN** 介面必須顯示該宗門對應的 route material、`sect:*:world-chapter-03` world memory tag 與用途摘要
- **AND** 該摘要必須連到 encounter、Workshop 或 Reincarnation hook 的可讀 cue
