# Design: Actor 視覺比例與怪物圖樣規格

## Context
目前正式 `AdventureStage` 已有玩家 sprite、NPC sprite 與腳底 y-depth 排序，但怪物仍以文字 token 顯示。怪物資料量已達 265 筆，若以單隻怪物為單位直接生成圖樣，會造成大量重複資產，也難以維持比例一致。

這個 change 的核心不是「產生圖片」本身，而是先建立可執行的 actor visual model：玩家、NPC、普通怪、精英怪與 Boss 必須共用同一套尺寸、錨點、遮擋與 asset registry 語意。

## Goals
- 以玩家角色 `1x2` 作為基準尺寸，讓怪物尺寸可被一致比較。
- 讓怪物可用不同視覺 footprint 與高度呈現，而不是全部壓成 1 格文字 token。
- 讓伏地、四足、長條、飛行、人形、靈體、巨型 Boss 有不同 sprite profile。
- 讓大型怪物的 render 大小先與 collision / pathfinding 解耦，降低一次改動風險。
- 讓 sprite 生成以 archetype / variant 分批規劃視覺語言，但每個 enemy template 最終都必須輸出獨立 movement / combat 圖檔資料夾。

## Non-Goals
- 本 change 不重新平衡怪物數值、掉落或戰鬥公式。
- 本 change 不要求所有怪物一次產完圖；必須先完成規格、registry 與代表性批次。
- 本 change 不改動 LocalStorage schema。
- 本 change 不要求大型怪物立刻擁有多格碰撞；初期可維持單格接戰點。

## Actor Visual Model
建議新增或等效建立下列視覺欄位，來源以 enemy catalog / player asset metadata / asset registry 為主：

- `visualArchetype`: 可重用圖樣族群，例如 `wolf`, `bear`, `sword_spirit`, `giant_crab`, `humanoid_bandit`, `dao_avatar`。
- `visualVariant`: 地圖、境界或元素變體，例如 `mortal`, `ice`, `fire`, `void`, `tribulation`, `emperor`。
- `bodyType`: `humanoid`、`quadruped`、`low_crawler`、`serpentine`、`winged`、`spirit`、`construct`、`colossus`。
- `footprintTiles`: 視覺佔地寬高，例如 `{ width: 1, height: 1 }`、`{ width: 2, height: 1 }`、`{ width: 4, height: 2 }`。
- `heightTiles`: 從腳底到頭頂的視覺高度，例如玩家為 `2`，高大型精英為 `3`，Boss 法相可為 `6`。
- `anchor`: 初期固定為 `feet`，大型與伏地怪仍以腳底或接地底線作 depth sorting。
- `collisionFootprintTiles`: 初期可不新增，或固定為 `{ width: 1, height: 1 }`；若未來要讓大型怪物阻擋多格，需另開 pathfinding / combat spec。

## Size Baseline
玩家角色定義為 `1x2`：

- 寬度約 1 tile。
- 視覺高度約 2 tile。
- depth sorting 使用腳底 y 座標。
- NPC 預設也應維持 `1x2` 或接近玩家比例。

以目前 player sheet 實測值作為第一版像素基準：

- `public/assets/generated/characters/player/mortal-male-v1/sheet-transparent.png` 的 movement actor 平均高度約 `80px`。
- `public/assets/generated/characters/player/mortal-male-combat-v1/sheet-transparent.png` 的 combat actor 平均高度約 `80px`。
- player 的 movement / combat 腳底線皆約在 `96px` cell 內的 `y=89`。
- 因此 `1x2` actor 的視覺高度基準為 `80px`，可推得 `1 tile` 視覺高度約 `40px`。
- 人形普通怪若 profile 為 `1x2`，movement / combat 都必須接近 player 高度；combat 可以因武器或手臂伸展而更寬，但不得整體變矮、變胖或變成大頭比例。
- 同一 actor 的 movement / combat 平均高度差距不得超過 `4%`；腳底線差距不得超過 `1px`。超過時必須重新生成或 frame-level normalization 後重新 QC。
- 同一 movement sheet 內，已通過 QC 的人形 frame 高度差距應控制在 `2px` 內；combat 因攻擊姿態可稍有差異，但 frame 高度差距應控制在 `4px` 內。

下列尺寸只作為可用刻度，不是固定套用表。實際分配必須依怪物名稱、描述、元素、rank、地圖語境與 body type 判定；例如「靈湖巨蟹」應比一般蟹更橫向且厚重，「北寒劍尊」即使是 Boss 也應偏高大人形 / 法相，而不是套成伏地巨獸。

可用尺寸刻度建議：

| 規格 | 用途 |
| --- | --- |
| `1x1` | 小鼠、蟲、小蛇、小型靈體 |
| `1x2` | 人形怪、劫匪、道童、劍客、一般妖獸 |
| `1x3` | 熊、巨猿、高大石像、重甲精英 |
| `2x1` | 低伏四足獸、蟹、龜、蜈蚣、小型伏地獸 |
| `2x2` | 大型野獸、蜘蛛、甲蟲、中型蛟類 |
| `3x2` | 巨蟹、巨型蜈蚣、大型構裝 |
| `4x2` | 長蛇、蛟龍、橫向伏地 Boss |
| `2x4` | 高大人形 Boss、鬼帝、劍尊法相 |
| `2x6` | 終盤巨型 Boss、天道化身、鴻蒙道祖投影 |

以 player `1x2 = 80px` 換算時，可得到一般 96px frame 的設計參考：

| 規格 | 參考視覺高度 | 語意 |
| --- | ---: | --- |
| `1x1` | 約 `40px` | 小型怪、低矮小生物 |
| `1x2` | 約 `80px` | 玩家、NPC、普通人形怪 |
| `1x3` | 約 `120px` | 高大人形、巨猿、石像，通常需要更大 frame 或 render scale |
| `2x1` | 約 `40px` 高、約 `80px` 寬 | 低伏四足、蟹、龜、蛇類普通怪 |
| `2x2` | 約 `80px` 高、約 `80px` 寬 | 大型野獸或厚重甲殼 |
| `3x2` | 約 `80px` 高、約 `120px` 寬 | 巨型甲殼、蜈蚣、長身獸 |
| `4x2` | 約 `80px` 高、約 `160px` 寬 | 長蛇、蛟龍、橫向 Boss |

若設計尺寸超過單一 `96x96` cell，asset registry 必須明確使用對應的大型 cell / render scale，不得把 `1x3` 或 `4x2` 強塞進普通 96px 人形格導致失真。

## Size Assignment Principles
實作時不得只依 rank 自動套尺寸；rank 只能作為放大上限與特效強度參考。

- 名稱含「鼠、蟲、蛭、蚊、蝠群」者，多半是 `1x1` 或小型群體視覺；若是精英可提升到 `1x2` 或 `2x1`。
- 名稱含「狼、豹、狗、蛇、道童、劍客、守衛、獵手」者，多半接近玩家尺度，落在 `1x2` 或 `2x1`。
- 名稱含「熊、猿、犀、巨人、石像、傀儡、甲獸」者，應比玩家高或厚重，常見為 `1x3`、`2x2` 或 `3x2`。
- 名稱含「蟹、龜、蜘蛛、蜈蚣、蠍」者，應優先考慮低伏橫向比例，常見為 `2x1`、`3x2` 或 `4x2`。
- 名稱含「蛟、龍、蟒」者，應優先考慮長條或盤繞形，常見為 `3x2`、`4x2` 或 Boss 專用更大尺寸。
- 名稱含「魂、靈、幽、鬼、劍意、幻影」者，應可比實體更高或漂浮，但 footing / shadow 仍需定義清楚；常見為 `1x2`、`1x3` 或 `2x4`。
- 名稱含「尊、帝、道祖、天道、時空、鴻蒙」者，Boss 視覺應偏法相、投影或領域存在，尺寸可以大，但必須保留可讀輪廓與攻擊 telegraph。
- 同一 archetype 在高境界 variant 可增加 aura、光輪、裂紋、羽翼或法陣，不一定只靠放大尺寸表現強度。

## Rank Visual Language
普通怪、精英怪與首領必須有可辨識的 rank 視覺差異，但差異不應只靠尺寸。尺寸由怪物語意決定，rank 則主要影響視覺強度、特效與 UI cue。

- 普通怪：乾淨輪廓、低飽和陰影、少量或無 aura；移動與攻擊動畫短且清楚。
- 精英怪：更明顯的外輪廓、元素色邊光、少量粒子或氣場、較醒目的攻擊前搖；可以比同 archetype 普通怪略大，但不能無條件放大。
- 首領 / Boss：專屬 silhouette 或法相層、強化 shadow / aura / ground ring、獨立 target marker、血條與 telegraph；Boss 應有比精英更明確的戰鬥前饋與場上存在感。
- 高境界 Boss 可加入領域、法陣、裂界、雷雲、星河等環境特效，但這些特效必須不遮蔽玩家操作與核心 HUD。
- 同一族群的普通 / 精英 / Boss 應保持共同基因，例如狼族仍像狼、蟹族仍是橫向甲殼，不應因 rank 改變成完全不同物種，除非資料描述明確如此。

## Monster Archetype Strategy
265 隻怪物都必須有獨立圖檔輸出；archetype 的用途是統一設計語言、prompt 模板與 QC 判準，不是讓多隻怪物共用同一個完成圖檔。每個 enemy template 最終都必須有：

- `public/assets/generated/characters/monsters/<enemy-id>-movement-v1/`
- `public/assets/generated/characters/monsters/<enemy-id>-combat-v1/`

可重用 archetype：

- 人形敵人：劫匪、道童、劍客、守衛、獵手、仙尊、道祖。
- 走獸：狗、狼、豹、熊、豬、猿、虎、鹿。
- 伏地 / 甲殼：蟹、龜、甲蟲、蜘蛛、蜈蚣、蠍。
- 蛇 / 蛟 / 龍：水蟒、水蛟、蛟龍、長蛇型 Boss。
- 靈體 / 魂體：劍魂、怨靈、幽靈、鬼帝、劍意殘魂。
- 構裝 / 石像：石像、傀儡、石靈、岩石巨人。
- 元素 / 法相：風元素、雷澤領主、天道化身、時空之主、鴻蒙道祖。
- 植物 / 毒物：毒花、荊棘妖、毒體、靈植怪。

## Required Animation Sets
怪物最終不得只停留在 idle token 或單方向展示。每個正式怪物 visual profile 都必須能對應完整行為圖樣：

- 四方向移動：上、下、左、右。
- 四方向戰鬥：上、下、左、右。
- 移動圖樣必須使用 player/NPC 的步態節奏：每個方向列的第 1、3 格為站定 / 重心 frame，第 2、4 格為左右腳或對應肢體交替的走路 frame，不得連續出現同一張或同一側邁步。
- 對四足、伏地、蛇形、飛行或靈體等非人形怪，也必須保留相同節奏語意：第 1、3 格是中性 / 收束姿態，第 2、4 格是左右肢、身體波峰、翅膀或能量節奏的相反 phase，不得四格都只是同一張位移。
- 戰鬥圖樣必須依 body type 呈現合理攻擊方式：人形揮砍 / 施法、四足撲擊、伏地怪鉗擊或毒刺、長條怪甩尾或吐息、靈體法術或衝擊。
- 共用 archetype 只能降低設計決策成本；套用到特定 enemy 時仍必須產出該 enemy 自己的 directional movement 與 directional combat asset。

## Per-Enemy Style Lock
同一隻怪物的 movement 與 combat 必須看起來是同一個角色 / 生物，而不是兩張風格相近但 identity 不同的圖。

每個 enemy 在產出 combat sheet 時，必須使用已通過 QC 的 movement sheet 作為 visual reference，並鎖定：

- silhouette：身形、頭身比例、尾巴 / 角 / 耳 / 甲殼 / 肢體特徵。
- palette：主色、陰影色、元素色、rank aura 強度。
- outline：描邊粗細、像素銳利度、透明邊緣處理。
- scale：同方向同姿態的視覺大小，不得 combat 明顯更大或更小。
- normalized frame size：同一 enemy 的 movement 與 combat frame 必須使用同一輸出 cell size；預設為 `96x96`，除非該 body type 明確需要大型 boss 專用規格。
- camera/view：同一個 topdown 或 3/4 角度語言。
- footline：腳底 / 接地線位置必須和 movement sheet 相容。

若 movement 與 combat 在視覺上像不同畫師、不同解析度、不同物種或不同 rank 特效，該 enemy 不得標記為 production-ready，即使兩張 sheet 各自通過 frame QC。

人形怪物必須參考既有 NPC / player 的修長比例，而不是大頭 chibi 比例。普通人形怪的目標為 96px frame 內約 80px 高、窄身、頭部比例接近 NPC；combat 動作可增加手臂或武器橫向寬度，但不得把整個角色放大。

數值 QC 不得取代視覺完整性檢查。每批圖樣都必須檢查 raw row sheet、processed transparent sheet 與 individual frame PNG；任何方向 row 若出現頭、尾、腳、武器、翅膀、角或特效被裁掉，即使 bbox / footline / scale 數值通過，也不得標記為 production-ready。

若 rollout 分批進行，允許先以 fallback token 顯示未完成怪物；但標記為 production-ready 的怪物不得缺少移動或戰鬥任一套圖樣。

## Rollout Order
1. 建立玩家 / NPC / 怪物共用尺寸與 depth helper 測試。
2. 為 `Enemy` 或等效 registry 增加非 persisted 的 visual metadata。
3. 先覆蓋前期三線與所有 Boss：
   - 凡人三線：北郊 / 西郊 / 東郊與三個凡人 Boss。
   - 練氣三宗野外與三個練氣 Boss。
   - 所有 `m*_b1` Boss 至少有獨立 visual profile。
4. 對已進 production-ready 的怪物，同步接上四方向移動與四方向戰鬥圖樣，不只接 idle。
5. 再覆蓋高境界 common / elite archetype 變體。
6. 維護逐隻怪物 checklist，記錄 movement / combat 的 `$generate2dsprite`、QC、production-ready 狀態。
7. 最後補齊 265 筆怪物的 movement / combat mapping completeness test。

## Rendering Rules
- 玩家、NPC、怪物必須進入同一個 depth-sorted actor layer。
- actor 本體以腳底 y 座標排序。
- 大型怪物 sprite 可以超出單格，但 depth sorting 的 anchor 必須仍落在腳底 / 接地底線。
- 名稱、任務標記、血條與 Boss telegraph 可以放在 overlay / combat layer，但不得破壞 actor 本體排序。
- 若大型 Boss 遮擋太多畫面，應透過透明度、輪廓、shadow 或 camera framing 修正，而不是壓回小尺寸。

## Persistence
不需要 migration。理由：

- 玩家性別、怪物 instance、當前地圖等 persisted state 已存在，不需要新增持久欄位。
- 怪物視覺資訊可由 `templateId` 回查 enemy catalog 與 asset registry。
- 玩家視覺資訊可由 `gender` 與現有 player asset registry 回查。
- 若未來實作需要保存 per-instance visual override，必須另開 persisted-state change。
