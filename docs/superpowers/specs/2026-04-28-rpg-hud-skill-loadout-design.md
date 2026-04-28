# RPG HUD 與功法操作設計

## 背景

目前底部 `功法` 入口會開啟萬界圖鑑的 `功法神通` tab。這適合查詢所有功法、來源、掉落與藏經閣路線，但不適合承接玩家已學功法、可裝備功法與戰鬥 loadout。主畫面左上角色卡也已具備 RPG HUD 基礎，但在 mobile viewport 上仍偏佔空間，任務追蹤與角色狀態缺少一個整體版面規格。

## 目標

1. 將底部 `功法` 入口改成角色自身的功法面板，而不是圖鑑。
2. 讓玩家可查看已學主動術式與被動心法，並選擇戰鬥使用的主動功法。
3. 將角色 HUD 與任務列表調整成 desktop / mobile 都可讀的 RPG 主畫面資訊層。
4. 讓藏經閣 NPC 與功法商店入口更清楚，區分凡界入門功法、宗門基礎功法、任務、怪物掉落與傳承來源。
5. 保留圖鑑作為資料庫與來源查詢，不再承擔玩家功法操作。

## 非目標

- 不重做技能資料池。
- 不新增多技能欄、連招欄或複雜技能 build preset。
- 不把圖鑑移除；圖鑑仍顯示所有功法與來源。
- 不把玩家、NPC、怪物改成 3D 或 pixel sprite。

## 功法 Loadout

玩家角色狀態新增 `equippedActiveSkillId`。若該欄位為 `null` 或指向未學 / 非主動 / 非本職業技能，戰鬥會 fallback 到既有最高階主動功法選擇，避免舊存檔或非法狀態破壞戰鬥。

新增 `components/game/SkillPanel.tsx`：

- 顯示目前裝備功法。
- 分區顯示已學主動術式與被動心法。
- 主動術式可按鈕裝備。
- 被動心法只顯示已生效，不提供裝備操作。
- 空狀態提示玩家可透過藏經閣、任務、怪物掉落或傳承取得功法秘卷。

## HUD 與任務列表

`GameHUD` 改為 mobile-first compact card：

- Desktop 保留左上角色卡，但降低垂直高度。
- Mobile 顯示 compact bar，詳細數值用較小 stat grid 呈現。
- 戰力、靈石、修為、壽元改為 2x2 compact grid。
- `QuestTrackerHUD` 在 desktop 位置跟隨角色卡下方，在 mobile 保持收合入口。

## 藏經閣與功法來源

現有 `skill_shop_mortal` 與三宗 `sect_skill_*` shop 保留。新增凡界 `藏經閣執事` NPC 指向 `skill_shop_mortal`，讓初階功法商店有正式地圖入口。宗門藏經閣 NPC 仍對應各宗門功法商店。

功法來源分工：

- 任務：入門或劇情承接功法。
- 怪物：精英 / Boss 掉落核心功法。
- 藏經閣：初階與宗門基礎功法。
- 傳承殿：高境界傳承功法。

## 主畫面 Layout v2

主畫面資訊架構固定為：

- 左上：角色 compact card。
- 左側：任務追蹤。
- 右上：小地圖。
- 右下：戰鬥目標 / 功法快捷狀態。
- 底部：道途、背包、功法、洞府、圖鑑、地圖。

這份設計先把方向固定，後續若要重做右下戰鬥快捷或更沉浸式背景，可另開獨立 OpenSpec。

## 實作追蹤

- `add-character-skill-loadout-panel` 新增 `character.equippedActiveSkillId`，migration 會將缺失、非字串、未學或非主動功法清為 `null`。
- `refine-mobile-rpg-hud-and-quest-list` 只調整 HUD / QuestTracker 版面，不新增 persisted state，因此不需要 migration。
- `clarify-scripture-pavilion-skill-acquisition` 只新增 NPC 資料與 ShopPanel copy，不新增 persisted state，因此不需要 migration。
- `plan-rpg-main-screen-layout-v2` 只固定主畫面資訊架構規格，不改 runtime，也不需要 migration。
- 驗證：targeted Vitest、完整 `npm test`、`npx tsc --noEmit`、`npm run build`、`npm run test:e2e`、四條 `openspec validate --strict`、`git diff --check`。
