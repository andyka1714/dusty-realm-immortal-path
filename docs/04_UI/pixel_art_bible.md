# 像素風 Art Bible

本文件是 `evaluate-pixel-art-vertical-slice` 的 pre-production 基線，用來把像素風方向從「可行」推進到「可直接執行 prototype」。

---

## 1. 目標

這份 art bible 不是 full rollout 的完整資產規範，而是先鎖定：

1. 視覺語言
2. tile / entity token / UI / VFX 規格
3. Adventure representative vertical slice 的具體範圍
4. web / mobile 驗證門檻
5. 自主生成素材在 prototype 階段的可用邊界

---

## 2. 視覺方向

### 2.1 核心關鍵詞

- 仙俠像素
- 乾淨輪廓
- 飽和點綴，不做全畫面高飽和
- 地景可讀性優先於裝飾量
- 戰鬥 cue 優先於背景細節

### 2.2 不走的方向

- 不做擬真像素 painting
- 不做超高密度 pseudo-HD 像素
- 不做 GBA 寶可夢那種完全無戰鬥 telegraph 的極簡場景
- 不在 prototype 階段追求八方向動畫與完整角色動作庫

---

## 3. Prototype 範圍

### 3.1 代表地圖

prototype 地圖固定使用：

- `東郊靈田 (map 20)`

理由：

1. 屬於早期小尺寸地圖，prototype 成本低
2. 地形語意清楚，適合先驗證地板、靈田、水邊、障礙與傳送門
3. 可以同時承接近戰怪與法術 / 遠程怪，不需要先進高境界場景才看得出 cue

### 3.2 最小角色組合

- `1` 個玩家文字 token
- `1` 個近戰怪文字 token
- `1` 個遠程 / 法術怪文字 token
- `1` 組傳送門 / 出口標記

這條 vertical slice 現在採用 hybrid 規則：

- 地圖與戰鬥 cue 使用像素化語言
- 玩家、NPC、怪物與角色本體維持文字化 token，而不是像素 sprite
- 角色辨識仍優先靠單字、框色、target 標記與 HUD，而不是完整角色繪製

### 3.3 最小戰鬥 cue

prototype 至少必須有：

1. 近戰命中閃擊
2. 投射物飛行
3. 危險區 / 範圍 telegraph
4. target focus / status cue

### 3.4 目前已落地的 runtime prototype

`evaluate-pixel-art-vertical-slice` 的第一批 runtime prototype 已接回 `Adventure`：

- `Adventure` 右上角已有 `像素原型` 切換按鈕
- 目前只在 `東郊靈田 (map 20)` 開放預覽
- prototype stage 與正式 `AdventureStage` 分離，避免污染正式流程
- 目前已接回：
  - `1` 個玩家 token
  - `2` 種怪物 archetype (`近戰 / 遠程`) token
  - 傳送門 marker
  - `近戰命中 / 投射物 / 危險區 / target focus / status cue`

這表示像素風方向已經不是只有文件，而是有可切換的 runtime vertical slice。

---

## 4. 像素格與縮放規格

### 4.1 基本資產尺寸

- 地面 tile：`16x16`
- 障礙 / 樹 / 石塊 / 靈田物件：`16x16` 或 `32x32`
- 傳送門 / 祭壇 / 大型物件：`32x32` 或 `48x48`
- VFX 單元：`16x16` 或 `32x32`
- 場上 entity token：以單字為核心，外框與 focus ring 隨 runtime cell 縮放，不另定 sprite sheet 尺寸

### 4.2 Runtime 顯示尺寸

- 桌機 prototype cell：`48px` (`16x16` tile 的 `3x`)
- 行動版 prototype cell：`32px` (`16x16` tile 的 `2x`)

這代表 prototype 階段不要沿用目前 `40px` cell 作為正式像素模式基準，因為 `40` 不是 `16` 的整數倍，畫面會糊。

### 4.3 縮放規則

- 一律使用 nearest-neighbor
- 不允許任意非整數縮放
- 優先固定 stage cell，再調整可視範圍
- 手機端優先降可視格數，不用模糊縮圖來硬塞更多內容

---

## 5. Entity Token 規格

### 5.1 表現原則

prototype 的玩家、怪物與 NPC 不再畫成像素 sprite，而是維持文字遊戲感的單字 token：

- 玩家固定顯示 `我`
- 怪物顯示名稱中最有辨識度的單字，例如 `鼬`、`狼`
- NPC / 功能點維持 `商`、`匠`、`長` 這類單字牌

### 5.2 token 組成

每個 entity token 至少包含：

1. 單字本體
2. 緊湊的單字牌框體
3. 陣營 / 類型顏色
4. target / 危險 / 狀態時的外圈或上方小標

預設 chrome 要更接近「地圖上掛著一塊字牌」而不是傳統 RPG sprite：

- 框體以緊湊圓角矩形或窄牌為主，不做大面積角色底座
- 玩家牌預設只顯示單字，不額外掛長 caption
- 怪物平時只顯示單字；被 target、精英或 Boss 狀態時，才允許在上方加最短名牌
- 名牌與 token 必須能在手機 `2x` 下維持清楚，不得依賴 hover 才能理解

不做：

- 八方向角色繪製
- 完整角色動作庫
- 依靠 sprite silhouette 才能理解的表現法

### 5.3 可讀性規則

- 單字本體必須在桌機 `3x` 與手機 `2x` 都能一眼看清
- 玩家、怪物、NPC 的框色與描邊必須明顯不同
- 玩家必須維持一眼可辨識的綠色自我牌，不與怪物共用色調
- target 怪物若顯示上方名牌，名牌必須短、暗底、不可遮住危險圈與狀態 cue
- 角色辨識優先靠文字、框色與 HUD，不靠貼圖細節

---

## 6. Tile 與場景規格

### 6.1 最小 tileset 類型

`東郊靈田` prototype 至少需要：

1. 泥土地
2. 草地
3. 靈田格
4. 水邊 / 淺水
5. 石塊 / 木樁障礙
6. 傳送門地標

### 6.2 地景層級

prototype 場景分成：

1. base ground
2. overlay detail
3. obstacle
4. combat cue / VFX
5. entity token
6. HUD / target marker

不要把全部細節塞進單層 tile。

### 6.3 陰影規則

- entity token 不依賴角色腳下陰影來辨識
- 大型障礙可有 baked shadow
- prototype 不做動態光影

---

## 7. VFX 與戰鬥 cue 規格

### 7.1 近戰命中

- 用 `16x16` 或 `32x32` 的斬擊閃擊
- 顏色偏亮，不做半透明模糊筆刷
- 最多 `3-4` 幀即可

### 7.2 投射物

- 保持小體積、高對比
- 必須能在地景上被看見
- 尾跡可用 `1-2` 幀殘影，不做長拖尾濾鏡

### 7.3 危險區 telegraph

- 像素圈線 / 像素符紋 / 閃爍地板格
- 不能直接套現在向量圓圈的視覺語言
- 但必須保留 battle core 的可讀性：玩家一眼就知道「哪裡危險」

### 7.4 狀態與 target cue

- 目標 focus 使用像素 reticle
- 狀態圖示控制在小尺寸、強符號化
- 不做過細文字疊在戰場上

---

## 8. UI 規格

### 8.1 HUD 原則

- HUD 仍維持 HTML / React 疊在 canvas 上
- 不把主要文字 HUD 做成場景內 sprite
- 戰場內 entity 只保留極短資訊：單字 token、target、status、damage cue

### 8.2 視覺語言

- UI 框體可採像素切角或像素描邊
- 文字大小優先可讀，不為了「純像素」犧牲資訊密度
- 現有五行語意仍保留，但要轉成像素色塊與 icon 語言

---

## 9. 調色策略

### 9.1 Prototype palette 原則

- 底色偏土、木、靈氣綠
- 危險提示偏紅 / 橙
- 法術 / 遠程偏青 / 藍
- 玩家高亮以偏暖白 / 金作區分

### 9.2 限制

- 單一小型 sprite 不超過約 `10-14` 個主色階
- prototype 不追求全遊戲共用單一超硬 palette
- 但同一張地圖內的素材要共用同一批色域

---

## 10. 效能與平台驗證

### 10.1 桌機目標

- 代表性 vertical slice 在一般桌機瀏覽器要維持接近 `60 FPS`
- 同屏顯示玩家、兩隻怪與最小 cue 時，不可有明顯卡頓

### 10.2 行動版目標

- 手機瀏覽器下至少維持可玩的 `30 FPS` 體感
- HUD 不可破版
- 點擊 / target / telegraph 必須保持可辨識

### 10.3 不驗證的內容

prototype 不要求：

- 全地圖 streaming
- 大量同屏怪物
- 全境界完整資產

### 10.4 目前已驗證到的內容

- 桌機 `3x` / 手機 `2x` 的整數倍像素縮放規則已有測試覆蓋
- prototype shell 的 legend 與 scope notice 已有元件測試覆蓋
- prototype stage 與正式 stage 已能在 `Adventure` 中共存切換
- `?pixel-prototype-preview=1` 已成為固定驗證入口，並可再用 `pixel-prototype-mode=desktop|mobile` 強制切到對應平台排版
- Safari 實測已確認 `Desktop 3x` 與 `Mobile 2x` 都能顯示代表地圖、Target HUD 與 performance panel
- 目前 representative vertical slice 的實測值可穩定落在 `BOOT 14-16ms / 400ms`，且 `FPS` 明顯高於桌機 `55` 與手機 `45` 的驗收線

### 10.5 仍待補的驗證

- 若進入下一條 `pixel-art full rollout`，才需要補更多地圖、更多怪物密度與更長時間運行下的實機 profile
- 目前 vertical slice 已不再缺第一輪 web / mobile / budget 驗證，而是缺是否值得擴張成正式 art direction 的決策

### 10.6 正式整合的收斂方向

若下一步要把像素風接回正式 `AdventureStage`，目前已鎖定的方向是：

- 只像素化正式主畫面的 terrain / background layer
- 玩家、NPC、怪物與戰鬥中的文字 avatar 維持現狀，不改成 prototype 的文字 token 牌
- combat overlay、target marker、status cue 與 portal marker 仍沿用正式版視覺語言
- `仙緣鎮 / 宗門` 這類安全地圖的 terrain 應偏向結構化鋪地、空地與連接路徑，而不是完全隨機野外 patch
- `Sea / Thunder / Immortal / Ultimate` 這類高境界 theme 也應有明確 macro shape，例如水帶、雷脈、天階或中央壇域，而不是只換 palette
- `Void / Spirit / Sky / Dark` 也應有可辨識的 terrain anchor，例如裂隙、法壇、登階與污池，避免高境界背景退化成只有調色的抽象底圖
- 有 Boss spawn 的正式地圖應在背景層自帶小型 arena / altar / battlefield clearing，讓戰鬥場域感來自 terrain，而不是改 entity token
- 同一個 theme 底下的不同正式地圖也不應完全共用同一版 floorplan；像 `太初外環 / 歸墟裂界 / 鴻蒙道宮` 這種都屬 `Ultimate`，仍應保留 route-specific 輪廓差異
- prototype 內的 entity token 實驗只保留在驗證入口，不直接推進到主流程

---

## 11. 自主生成素材的邊界

### 11.1 可以由 agent 自主生成的

- 地圖 tileset placeholder
- 像素 VFX
- 像素 portal / altar / focus marker
- 小型 UI ornament
- entity token 的字體、框體與簡化狀態標記

### 11.2 可生成但不能直接承諾 production-ready 的

- 長期共用的完整 entity token 視覺系統
- 大量怪物族群的最終命名字典與單字映射規則
- 全專案一致的高品質像素 UI pack

### 11.3 Review gate

prototype 階段允許自動生成後直接接線驗證。  
若要進 full rollout，至少要再 review：

1. silhouette 是否穩定
2. palette 是否一致
3. token 的單字、框色與 cue 是否不互相搶可讀性
4. 手機端可讀性是否仍成立

---

## 12. Prototype 驗收條件

要視為 vertical slice 成立，至少要滿足：

1. `東郊靈田` 能以像素風 tile / terrain cue 正常顯示
2. 玩家、近戰怪、遠程 / 法術怪都能透過文字 token 被看懂
3. 近戰命中、投射物、危險區、target focus 四類 cue 都能在像素語言下成立
4. 桌機與手機端都沒有明顯模糊或 HUD 崩壞
5. 團隊能根據這份 hybrid 基線決定是否值得開下一條 `pixel-art full rollout`
