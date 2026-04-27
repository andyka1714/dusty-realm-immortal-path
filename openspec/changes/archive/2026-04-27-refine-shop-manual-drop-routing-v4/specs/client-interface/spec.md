## MODIFIED Requirements

### Requirement: 圖鑑分類與瀏覽可讀性
介面必須 (MUST) 讓 `萬界圖鑑` 的物品、功法與宗門資料以可掃描的分類與來源追蹤方式呈現，而不是只把所有資料平鋪在同一個長頁中。

#### Scenario: 功法神通顯示秘卷來源
- **WHEN** 圖鑑顯示正式 core skill
- **THEN** 介面必須能顯示對應 manual source labels
- **AND** 若技能書 route 能推導具體商店、精英、Boss 或傳承殿名稱，介面必須顯示具體來源名稱
- **AND** 不得要求玩家從 internal skill id 或抽象 source tier 推測技能來源
