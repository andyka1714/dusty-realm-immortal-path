# UI 組件規範 (UI Components)

## 1. 配色系統 (Tailwind)
遵循五行配色：
- **金**: `yellow-500`
- **木**: `emerald-500`
- **水**: `blue-500`
- **火**: `red-500`
- **土**: `amber-700`

## 2. 常用組件
- **Button**: 主要按鈕使用 `amber` 色系，次要按鈕使用 `stone` 色系。
- **Modal**: 居中彈窗，背景帶 `backdrop-blur`。
- **Tooltip**: 滑鼠懸停顯示詳細資訊。

### 目前正式 UI 殼層收斂

- `GamePanel`：主遊戲大面板，已正式具備 `eyebrow + title + icon` 結構。
- `Modal`：任務、商店、突破、地圖總覽、背包確認等視窗，已開始對齊同一套 `eyebrow + title + icon` 語言。
- `GameSection`：面板內部的次級資訊框體，統一 `eyebrow + title + ornament frame`，避免屬性區、貨單區、裝備區各自維護近似框體。
- `GameTooltip`：角色屬性、商店、圖鑑、地圖情報等資訊浮層，已開始對齊同一套 `eyebrow + title + body + footer` 結構。
- `GameTitleStack`：`GamePanel / Modal / GameTooltip` 共用的標題層組件，統一 `eyebrow + title (+ icon)` 的字階與間距。
- `GameOrnamentFrame`：`GamePanel / Modal / GameTooltip` 共用的內框、角飾、頂部光帶與背景光暈裝飾層，不再各自維護一份近似 ornament markup。
- `GamePanel / Modal` 內原本重複存在的 eyebrow 裝飾已移除，現在正式由 `GameTitleStack` 單點承接標題階層，不再重複堆兩層同名標識。
- `StatsPanel / ShopPanel / Inventory / Dashboard / QuestModal` 內部的關鍵資訊區，也已開始改走 `GameSection`，面板內層不再只有單純的邊框盒與 `border-l` 小標。
- `Workshop` 的聚靈陣 / 煉丹 / 煉器卡片，也已開始改走 `GameSection`，洞府百業不再維持獨立的卡片語言。
- `Adventure` 的底部戰鬥快捷列也已開始改走 `GameSection`，地圖即時戰鬥的操作面正式吃到同一套 section chrome。
- `Inventory` 的裝備、技能書與消耗品 hover，也已切到同一套 `GameTooltip` 結構，不再只靠右側詳情面板承接全部資訊。
- `QuestModal` 的裝備 / 技能書任務獎勵，也已補上 hover `GameTooltip`，不再只剩純文字獎勵列。
- `QuestModal` 的獎勵 tooltip 標題，也已開始對齊品質色階，和商店 / 背包裝備共用同一套辨識語言。
- 區域地圖情報、商店貨品、角色屬性、任務獎勵與背包 hover，目前都已進同一套 `GameTooltip` 語言，不再各自維護不同浮層結構。
- `GameHintBubble`：操作提示、dock 切換、背包按鈕等短提示，作為輕量級懸停語言；現在也開始補齊 `eyebrow + body` 層級，讓短提示不再只是裸文字浮泡。
- 區域地圖傳送點 / NPC、工坊升級、圖鑑掉落品階 badge、背包物品操作等尾端提示，也已補齊 `eyebrow`，短提示層級更一致。

### 圖鑑資訊架構收斂

- `CompendiumModal` 的 `神兵法寶` 已移除會覆蓋卡片的 sticky 境界標題；境界 section header 現在只作為普通分段標識，不再蓋住第一排物品。
- `功法神通` 已改為 `通用 / 劍修 / 體修 / 法修` 的內層分類，並在每個分類內按境界分組，避免 formal core 技能全量平鋪。
- `功法神通` 卡片現在直接顯示主動 / 被動、境界、職業與來源層級，例如藏經閣、精英掉落、首領核心或古修傳承。
- `宗門傳承` 已改為三宗聚焦 tabs；同一時間只顯示一宗的人物、傳承功法與章節線索，行動版不再一次展開三宗長頁。
- `神兵法寶` 的來源資訊會從既有 catalog 推導：敵人掉落、商店、Workshop 產物、Workshop sink、encounter route cue 與宗門 world memory 會統一收斂到 `來源追蹤`。
- `凌霄劍星鋼 / 萬獸血骨殘材 / 縹緲星魂蓮` 這類 route-specific material 必須在圖鑑卡片上顯示對應宗門、`sect:*:world-chapter-03` 與至少一個 Workshop sink，避免玩家只能看到抽象描述。
- `功法神通` 與 `宗門傳承` 的 skill card 除了 formal source tier，也應顯示秘卷來源 labels，例如凡界藏經閣、宗門入門試煉、同境界精英、同境界 Boss 或古修傳承。
- 這次變更只調整圖鑑瀏覽與 layout，不新增 item / skill / quest id，也不改 LocalStorage schema；不需要 migration。
