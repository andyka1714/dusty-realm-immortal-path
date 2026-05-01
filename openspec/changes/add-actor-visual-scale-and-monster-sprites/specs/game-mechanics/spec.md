## ADDED Requirements

### Requirement: 怪物視覺 profile 必須由怪物語意推導
系統必須 (MUST) 為怪物建立視覺 profile，並依怪物名稱、描述、body type、元素、rank 與地圖語境決定合適尺寸，而不是只用 rank 或固定表格自動套用。

#### Scenario: 同 rank 怪物可有不同尺寸
- **WHEN** 兩隻怪物同為 `EnemyRank.Boss` 但一隻是人形劍尊、另一隻是蛟龍或巨蟹
- **THEN** 兩者可以有不同 `footprintTiles` 與 `heightTiles`
- **AND** 尺寸差異必須能從怪物名稱、描述或 body type 解釋

#### Scenario: 低伏與長條怪依身形設計
- **WHEN** 怪物語意屬於蟹、龜、蜘蛛、蜈蚣、蛇、蟒、蛟或龍
- **THEN** visual profile 必須優先評估橫向或長條 footprint
- **AND** 不得強制套用玩家型 `1x2` humanoid 比例

#### Scenario: 人形與法相 Boss 保留人形辨識
- **WHEN** Boss 語意屬於劍尊、鬼帝、仙尊、天道化身或道祖
- **THEN** visual profile 必須保留人形、法相或投影辨識
- **AND** 不得只因 Boss 身分就轉成伏地巨獸比例

### Requirement: 怪物資產完整度必須涵蓋移動與戰鬥
怪物 sprite rollout 必須 (MUST) 把 movement 與 combat 都視為正式資產的一部分。

#### Scenario: Production-ready 怪物解析完整行為資產
- **WHEN** 怪物被標記為 production-ready sprite
- **THEN** registry 必須能解析其四方向 movement asset 與四方向 combat asset
- **AND** 缺少任一行為資產時，completeness regression 必須失敗

#### Scenario: Archetype 共用不降低行為完整度
- **WHEN** 多個怪物共用同一個 visual archetype 與變體圖樣
- **THEN** archetype 只能共用設計語言、prompt pattern 與 QC 判準
- **AND** 每個套用該 archetype 的 enemy template 仍必須有自己的 movement 與 combat asset definition
- **AND** production-ready 狀態不得跨 enemy id 共用

#### Scenario: Checklist 追蹤每隻怪物完成度
- **WHEN** 怪物圖樣 rollout 分批進行
- **THEN** 文件或 registry audit 必須能列出每個 enemy template 的 movement / combat 生成狀態
- **AND** checklist 必須區分 pending、generated、QC failed 與 production-ready
- **AND** checklist 必須追蹤 movement / combat pair style QC，避免同一怪物兩套圖樣風格不一致

### Requirement: Rank 視覺語言必須與怪物語意並存
怪物視覺 profile 必須 (MUST) 同時保留怪物物種 / body type 語意與 common / elite / boss rank 差異。

#### Scenario: Rank 不改寫物種語意
- **WHEN** 同一 archetype 有普通、精英或 Boss 變體
- **THEN** 這些變體必須保留共同 silhouette 或物種特徵
- **AND** 不得只因 rank 提升就變成完全無關的身形或物種

#### Scenario: Rank 影響視覺強度
- **WHEN** 系統建立怪物 visual profile
- **THEN** `EnemyRank.Common`、`EnemyRank.Elite` 與 `EnemyRank.Boss` 必須能對應不同視覺強度設定
- **AND** 視覺強度可以包含 aura、outline、shadow、telegraph、血條或 animation intensity
- **AND** 尺寸仍必須依怪物語意判定，不得只用 rank 決定

### Requirement: 怪物視覺資料不應寫入 persisted state
怪物視覺 profile 與 sprite asset mapping 必須 (MUST) 從 enemy template、asset registry 或靜態 catalog 推導，不得為了顯示尺寸新增 LocalStorage persisted 欄位。

#### Scenario: 從 templateId 回查視覺 profile
- **WHEN** Adventure runtime 需要渲染 active monster
- **THEN** 系統必須能從 monster `templateId` 回查 enemy visual profile
- **AND** 不需要在 active monster persisted state 中保存 render footprint、height 或 sprite asset id

#### Scenario: 未知 profile 回退文字 token
- **WHEN** 某 enemy template 尚未定義 visual profile
- **THEN** 系統必須回退到現有文字 token 或安全 fallback
- **AND** 不得因缺少 sprite metadata 導致地圖或戰鬥流程崩潰
