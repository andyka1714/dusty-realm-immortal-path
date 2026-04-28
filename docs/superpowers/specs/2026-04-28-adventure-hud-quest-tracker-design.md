# Adventure HUD 與任務追蹤規劃

## 背景

目前主遊戲畫面的資訊分布已經有幾個穩定基礎：

- `GameHUD` 位於左上角，顯示角色名稱、境界、活動狀態、靈石、修為與壽元。
- `Adventure.tsx` 右上角有小地圖、座標、地圖展開按鈕與部分 debug / utility 按鈕。
- `FloatingDock` 位於底部，提供 `道途 / 背包 / 洞府 / 圖鑑` 面板入口。
- `Adventure.tsx` 目前還有 `戰鬥快捷列`，提供普攻、主動術式、掛機、地圖等按鈕。
- Quest state 已存在於 `quest.activeQuests / completedQuests`，但主畫面沒有任務追蹤 HUD。
- Enemy catalog 已有 `hp / maxHp / attack / defense / element / specialAttack / drops / exp / rank / realm`，但圖鑑與場景 HUD 目前沒有完整呈現。

使用者希望主畫面更接近常見 RPG / MMO HUD：左上角角色狀態、右上小地圖、左側任務追蹤、底部常用功能入口、場景內點擊即可戰鬥，不需要大型戰鬥快捷列。

## 目標

1. 將左上角角色狀態升級成完整狀態卡：頭像槽、名稱、境界、等級換算、HP、MP、戰力。
2. 在左側加入當前任務追蹤欄，顯示主線 / 支線 / 宗門任務的目前進度。
3. 將右上小地圖下方的 utility buttons 收斂，避免和任務追蹤或底部 dock 互搶視線。
4. 將底部 dock 調整成主要功能入口：角色、背包、技能 / 功法、洞府、圖鑑、地圖。
5. 弱化或移除大型 `戰鬥快捷列`，讓戰鬥主要依靠點擊場景、選取目標、點技能 icon 或自動掛機切換。
6. 擴充怪物資訊呈現：圖鑑與目標卡都應顯示 HP、攻擊、防禦、元素、特殊攻擊、戰力與掉落。

## 非目標

- 不把遊戲改成網路遊戲式的活動 / 福利 / 排行榜 / 公會上排入口。
- 不新增角色大頭照 asset pipeline。第一版可以用職業 / 性別 / 靈根圖標作為暫代 avatar。
- 不重做 AdventureStage renderer。
- 不新增第二套 quest engine。
- 不把普攻 / 技能從 keyboard-only 改成完全沒有快捷鍵；鍵盤可以保留，但不再把大型快捷列當主 UI。

## 一、左上角角色狀態卡

### UI 結構

左上角建議改成橫向狀態卡：

- 左側：大頭像槽
  - 第一版可用職業 icon、性別 icon 或靈根 icon。
  - 尚無正式 avatar 時，不要用外部圖或 AI 假圖。
- 右側上排：
  - 角色名稱
  - 境界文字，例如 `凡人 初期`
  - 等級換算，例如 `Lv.1`、`Lv.50`
- 右側中段：
  - HP bar：`氣血 370 / 370`
  - MP bar：`靈力 168 / 168`
- 右側下段：
  - 戰力：`戰力 12,580`
  - 活動狀態：修煉中、探索中、戰鬥中、閉關中

### 等級換算建議

目前角色用 `majorRealm + minorRealm` 表達境界，沒有傳統 level。可用 deterministic formula 推導：

```text
level = majorRealm * 10 + minorRealm + 1
```

例：

- 凡人初期：`0 * 10 + 0 + 1 = Lv.1`
- 築基初期：`2 * 10 + 0 + 1 = Lv.21`
- 仙帝圓滿：`11 * 10 + 9 + 1 = Lv.120`

這不需要新增 persisted state，只是 UI derived value。

### HP / MP 來源

目前 `calculatePlayerStats` 已能推導 HP / MP：

- HP: 由體魄、境界、裝備等推導。
- MP: 由神識、境界、裝備等推導。

第一版左上角可先顯示：

- 非戰鬥：`maxHp / maxHp`、`maxMp / maxMp`
- 世界戰鬥中：讀 `worldPlayerHp` 與未來 `worldPlayerMp`

如果 `worldPlayerMp` 尚未實作，HUD 可先顯示 max MP，但規劃上應和 `add-spirit-power-runtime` 合併。

## 二、戰力公式

### 設計原則

戰力是 UI 摘要，不應直接成為所有戰鬥公式的唯一真相。它應該幫玩家快速比較自己、怪物、裝備與境界強弱，但實際戰鬥仍由攻擊、防禦、技能、元素、狀態與 AI 決定。

### 建議公式

第一版建立 `utils/combatPower.ts`：

```text
basePower =
  maxHp * 0.35
  + maxMp * 0.18
  + attack * 9
  + defense * 7
  + speed * 4
  + critChance * 120
  + critDamage * 80
  + dodge * 100
  + lifesteal * 90

realmMultiplier = 1 + majorRealm * 0.18 + minorRealm * 0.015
rankMultiplier =
  Common: 1.00
  Elite: 1.25
  Boss: 1.65

combatPower = floor(basePower * realmMultiplier * rankMultiplier)
```

角色戰力使用 `calculatePlayerStats` 結果。怪物戰力使用 enemy catalog：

```text
enemyBasePower =
  maxHp * 0.35
  + attack * 9
  + defense * 7
  + specialAttackBonus

specialAttackBonus =
  specialAttack exists ? attack * 5 : 0
```

### 為什麼不用單純 HP + 攻擊

高境界怪物與玩家的差異不只來自血量和攻擊。若不計防禦、速度、暴擊、技能與 rank，圖鑑戰力很容易誤導玩家，尤其 Boss / Elite 會被低估。

### 驗證

- 新增 `utils/combatPower.test.ts`
- 檢查同境界 Boss > Elite > Common
- 檢查高境界普通怪 > 低境界 Boss 不一定，但通常應有合理上升趨勢
- 檢查角色裝備提升會提高戰力

## 三、任務追蹤欄

### UI 位置

任務追蹤建議放左側、角色狀態卡下方，和參考圖一致：

- Desktop：左上角色卡下方，寬度約 `320px - 380px`
- Mobile：可收合成小按鈕，點開成底部 sheet 或左側 overlay
- 不放在右上小地圖下方，避免右上資訊過滿

### 顯示內容

第一版顯示最多 4 條：

1. 主線任務優先
2. 宗門任務其次
3. 支線任務最後
4. 可完成任務排在同類型最上方

每條任務顯示：

- 類型 chip：`主線`、`宗門`、`支線`
- 任務標題
- 目前進度：
  - kill / item：`2 / 5`
  - dialogue：`與某 NPC 對話`
  - level：`突破至築基`
  - ready：`可回報`
- 下一步短句：從 quest requirement 推導，而不是新寫一套任務描述。

### 資料來源

用既有資料：

- `QUESTS[questId]`
- `quest.activeQuests[questId].progress`
- `quest.activeQuests[questId].isReadyToComplete`
- `quest.completedQuests`

新增 helper：

```text
utils/questTracker.ts
```

提供：

- `getQuestTypeLabel`
- `getQuestTrackerRows`
- `getQuestRequirementProgressLabel`
- `sortTrackedQuests`

### 不新增 persisted state

任務追蹤是 derived UI。第一版不需要 `trackedQuestIds`。如果未來要玩家手動釘選任務，再另開 migration-bearing change 或使用 local UI preference。

## 四、右上小地圖與按鈕

### 小地圖保留

右上小地圖目前已提供：

- 玩家位置
- 附近怪物點
- Boss / 怪物顏色
- 座標
- 點擊展開地區 / 世界地圖

這部分應保留，但視覺上可以更接近遊戲 HUD：

- 圓形或八角形 frame
- 顯示地圖名稱
- 座標放小地圖下緣
- hover / focus 顯示 `展開地圖`

### 小地圖下方按鈕

建議只保留與地圖直接相關的按鈕：

- 地區地圖
- 世界地圖
- 自動尋路 / 掛機開關

不要在小地圖下方塞角色、背包、圖鑑，這些應移到底部 dock。

### Pixel preview debug

目前右上有切換 `pixel_prototype` 的按鈕。這是 debug / dev 功能，不應成為正式玩家 HUD。建議：

- 開發模式或 query flag 才顯示。
- 正式 HUD 不顯示這顆按鈕。

## 五、底部功能 dock

### 建議按鈕

底部 dock 建議改成主要功能入口：

- 角色 / 道途
- 背包 / 行囊
- 技能 / 功法
- 洞府 / 百業
- 圖鑑
- 地圖

其中 `技能 / 功法` 可先導到 Compendium 的 `功法神通` tab，或後續獨立開 skill panel。不要第一版就重做技能系統。

### 現有 FloatingDock 調整

`FloatingDock` 目前已有：

- `character`
- `inventory`
- `workshop`
- `compendium`

下一步可新增：

- `skills`
- `map`

但 `GamePanelId` 需要調整，`GameShell` 也要知道如何開啟對應 panel 或傳 initial tab。

### Mobile

Mobile 底部 dock 需要避免遮住重要戰鬥 UI：

- 使用 safe area bottom。
- icon 優先，文字可在窄螢幕隱藏。
- active panel 時 dock 可保持，但不能遮住 modal CTA。

## 六、戰鬥快捷列

### 現況

`Adventure.tsx` 目前有 `戰鬥快捷列`，包含：

- 普攻
- 主動術式
- 掛機
- 地圖

使用者認為大型快捷列不需要，因為場景可直接點擊操作，遊戲也不必假設鍵盤操作。

### 建議處理

不要一次刪掉所有能力，而是拆成：

1. 場景點擊：
   - 點怪：選取 / 接戰
   - 近距離再點：普攻或互動
2. 小型技能輪：
   - 右下或底部靠右顯示 1 到 3 個技能 icon
   - 只在有目標或戰鬥中顯示
3. 掛機開關：
   - 移到小地圖下方或底部 dock 次要按鈕
4. 地圖：
   - 移到小地圖或底部 dock

大型 `GameSection` 版 `戰鬥快捷列` 可以在這條 change 內移除或改成 debug fallback。

### 驗證

- Playwright 應檢查：
  - safe village 不顯示戰鬥快捷列。
  - 點擊鄰近怪物仍會接戰。
  - 有目標時技能 icon 不遮住底部 dock。
  - mobile 上 HUD 不水平溢出。

## 七、怪物資訊與圖鑑擴充

### 目標卡

當玩家選取怪物時，場景內應顯示小型目標卡：

- 名稱
- 境界 / rank
- 戰力
- HP bar
- 元素
- 弱點 / 抗性
- 特殊攻擊名稱與冷卻

目前 `targetedMonsterTemplate` 已能取得部分資訊，應從 existing enemy template 推導。

### 圖鑑妖獸頁

目前圖鑑 `山川妖獸` 偏少，只顯示境界和掉落。建議補：

- HP / 攻擊 / 防禦
- 戰力
- 元素
- 弱點 / 抗性
- AI 風格：近戰、遠程、施法
- 特殊攻擊
- 掉落
- 出沒地圖

### 技能資訊

Enemy `specialAttack` 已存在，但不是所有怪都有技能。圖鑑應清楚區分：

- 有特殊攻擊：顯示名稱、冷卻、效果摘要
- 沒有特殊攻擊：顯示 `無特殊攻擊`，不要留空白

## 八、建議 OpenSpec 拆案

### Change 1. `update-adventure-hud-layout`

範圍：

- 左上角色狀態卡
- 右上小地圖視覺與按鈕收斂
- 底部 dock 新資訊架構
- 移除或弱化大型戰鬥快捷列

驗證：

- `tests/e2e/shared-ui-foundation.spec.ts`
- `components/game/GameHUD.test.tsx`
- `components/game/FloatingDock.test.tsx`

### Change 2. `add-quest-tracker-hud`

範圍：

- `utils/questTracker.ts`
- 左側任務追蹤欄
- active quest sorting / progress labels
- mobile 收合狀態

驗證：

- `utils/questTracker.test.ts`
- `components/game/QuestTrackerHUD.test.tsx`
- Playwright active quest smoke

### Change 3. `add-combat-power-and-enemy-intel`

範圍：

- `utils/combatPower.ts`
- 角色戰力
- 怪物戰力
- 圖鑑妖獸頁資訊擴充
- 選取怪物目標卡資訊擴充

驗證：

- `utils/combatPower.test.ts`
- `components/Compendium/CompendiumModal.test.tsx`
- Playwright compendium / target card smoke

### Change 4. `add-spirit-power-runtime`

範圍：

- 正式世界戰鬥 MP runtime
- 技能 MP 消耗
- 補靈丹 / full_restore 的可見 runtime 效果
- HUD HP / MP 同步

驗證：

- `utils/consumableEffects.test.ts`
- `pages/Inventory.supplies.test.tsx`
- `utils/battleSystem.test.ts`
- Playwright combat smoke

## 九、建議執行順序

1. `add-combat-power-and-enemy-intel`
   - 先補戰力公式與圖鑑資訊，讓左上角色卡和怪物卡有可靠資料來源。
2. `update-adventure-hud-layout`
   - 再調整整體 HUD 與底部 dock，避免 UI 先做完又缺資料。
3. `add-quest-tracker-hud`
   - 任務追蹤欄接上左側資訊架構。
4. `add-spirit-power-runtime`
   - 最後處理 MP runtime，因為它會碰戰鬥流程與消耗品，比純 UI / derived data 風險高。

## 十、風險與控制

- 風險：HUD 太像 MMO，和單機修仙定位不一致。
  - 控制：不放活動、福利、排行榜、公會等網遊入口；只保留角色、任務、地圖、背包、技能等單機核心資訊。
- 風險：戰力公式被誤認為戰鬥公式。
  - 控制：文件與 tooltip 明確寫成評估值，實際戰鬥仍由 stats / skills / element / status 決定。
- 風險：底部 dock 和 mobile 操作互相遮擋。
  - 控制：Playwright mobile viewport 必須驗證 dock、任務追蹤、小地圖、pending encounter 不重疊。
- 風險：任務追蹤需要新 persisted pin state。
  - 控制：第一版只用 active quest derived sorting，不做手動釘選。
- 風險：MP runtime 牽涉太廣。
  - 控制：先把 MP runtime 獨立成第四條 change，不混進 HUD layout。

## 共用驗證 gate

每條 change 收口時至少跑：

- `openspec validate <change-id> --strict`
- Targeted tests
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e -- tests/e2e/shared-ui-foundation.spec.ts --project=chromium`
- `openspec validate --all --strict`
- `git diff --check`
