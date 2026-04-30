# Design: 人形 Sprite 標準化管線

## Context

男女凡人走路圖資目前不是單一美術瑕疵，而是缺少一致輸出標準造成的系統性問題。現況量測結果顯示男角 frame 高度約 `69-72px`，女角約 `73-81px`；同時背面髮型與包頭在不同方向列之間不一致，部分修補還會造成不自然的浮球或頭盔感。未來 NPC 若沿用同一流程，會把這些問題擴散到更多角色。

## Goals

- 所有人形 player / NPC walk sprites 在地圖上有一致尺度。
- 每個 frame 的腳底位置與中心位置穩定，避免方向切換時上下左右漂移。
- 頭髮、包頭、帽子等上緣特徵必須包含在同一個高度盒內，不得被切掉或另外補出不自然形狀。
- 戰鬥 sheet 必須與 walk sheet 使用相同方向順序與人形定位基準，避免戰鬥時只支援單一角度。
- QC gate 能在寫入正式 assets 前拒收錯誤 sheet。
- Runtime 只使用已通過 QC 的獨立 frame PNG，避免 sheet 邊界取樣污染。

## Non-Goals

- 不在本 change 重新定義怪物、大型 boss 或非人形召喚物的尺寸規格。
- 不新增 persisted actor sprite state。
- 不一次產出所有 NPC；本 change 只建立可套用於 NPC 的標準與 player 範例。

## Humanoid Walk Standard

人形 walk sprite 必須使用：

- frame size: `96x96`
- sheet size: `4x4`
- row order: `down`, `left`, `right`, `up`
- columns: `idle/neutral`, `step A`, `idle/neutral`, `step B`
- footline: `y = 88`
- center line: `x = 48`
- target humanoid height: `80px`
- height tolerance: `±1px`
- center tolerance: `±1px`
- footline tolerance: `0px`

`80px` 是包含頭髮、髮髻與帽子的完整人形高度，不是身體高度。若角色有高帽、法冠或明顯髮飾，必須在 prompt 或 asset metadata 標示是否使用特殊 profile；預設凡人、村民、商人、宗門弟子都必須符合一般 humanoid profile。

## Humanoid Combat Standard

人形 combat sprite 必須使用：

- frame size: `96x96`
- sheet size: `4x6`
- row order: `down`, `left`, `right`, `up`
- columns: `guard`, `wind-up`, `commit`, `impact`, `recover`, `return guard`
- frames per direction: `6`
- footline: `y = 88`
- center line: `x = 48`
- target humanoid height: `80px`
- max attack bbox width: `90px`
- center tolerance: `±2px`

戰鬥 sheet 使用 6 格而不是 4 格，因為 4 格只能表達「準備、出手、命中、回復」的粗略節點；6 格可以多出 wind-up 與 recovery，讓不同攻速下仍有完整起手與收招。8 格可以更細，但在目前地圖角色尺寸與攻速同步需求下，素材量與辨識收益不成比例，先保留為後續高階角色或 boss 的可選 profile。

## Pipeline

1. Prompt 要求完整 4x4 walk sheet 或 4x6 combat sheet、固定比例、完整髮型與 solid chroma background。
2. 後處理先切成 16 個 raw cells。
3. 每格以非背景 alpha bbox 找出角色主體。
4. normalizer 以主體 bbox 等比例縮放到 target height。
5. 將角色腳底貼齊 `y=88`，中心貼齊 `x=48`。
6. walk 產出 `frames/player_sheet-N.png`；combat 產出 `frames/combat_sheet-N.png`、方向 GIF、`sheet-transparent.png`、`animation.gif`、`pipeline-meta.json`。
7. QC 重新讀取正式輸出，不使用暫存檔結果作為完成依據。

## QC Gate

每個人形 walk / combat asset 必須檢查：

- walk 的 16 個 frame 或 combat 的 24 個 frame 都非空。
- 每格只有一個主要 connected component；不得有大於門檻的 detached fragment。
- 每格不得碰到 frame 邊界。
- 每格不得含 chroma-key 或高飽和背景殘邊。
- 每格 footline 必須為 `88`。
- 每格 bbox center 必須在 `47-49` 之間。
- 每格 bbox height 必須在 `79-81` 之間。
- sheet 與 `frames/` 的像素內容必須一致。
- AdventureStage 必須載入獨立 frame PNG，不得以 runtime rectangle 切整張 sheet 當玩家 walk frames。
- Combat animation 必須依目前面向選擇對應 row，並用每方向 6 格對齊攻擊 active window。

## Asset Metadata

`GeneratedSpriteMetadata` 需要能記錄 humanoid profile，例如：

- `profile: "humanoid"`
- `frameWidth: 96`
- `frameHeight: 96`
- `targetHeight: 80`
- `footlineY: 88`
- `centerX: 48`
- `rowOrder: ["down", "left", "right", "up"]`
- combat asset 另需記錄 `framesPerDirection: 6` 與 `maxWidth: 90`
- `qcStatus: "passed"`

實際欄位可在實作時依現有型別最小擴充，但 metadata 必須足以讓 tests 和後續 NPC asset authoring 讀懂這套標準。

## Verification

- 新增 normalizer / QC 的單元測試。
- 對男女凡人走路素材跑 image QC fixture。
- 驗證 asset registry 中 player walk assets 帶有 humanoid metadata。
- 驗證 AdventureStage 使用獨立 frame URLs。
- 執行 `npm test -- data/assets/assetRegistry.test.ts utils/playerSpriteAnimation.test.ts utils/pixelAdventurePrototype.test.ts`。
- 執行 `npm run typecheck`。
- 執行 `openspec validate add-humanoid-sprite-standard --strict`。
