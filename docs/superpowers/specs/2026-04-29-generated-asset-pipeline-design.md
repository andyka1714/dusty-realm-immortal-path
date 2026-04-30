# Generated Asset Pipeline Design

## 背景

目前遊戲的角色、NPC、妖獸、物品、地圖與戰鬥效果主要依賴文字、符號與 CSS 呈現。接下來若要使用 `$generate2dsprite` / `$generate2dmap` 產生素材，必須先建立一致的素材管理方式，避免資料表直接散落圖片路徑，造成風格、版本與替換成本失控。

## 目標

1. 建立遊戲共用的 `assetId` 與 `AssetDefinition`。
2. 將生成素材放在可被 Vite runtime 直接讀取的 `public/assets/generated/**`。
3. 所有素材保留 `raw`、`transparent sheet`、`frames`、`preview`、`prompt-used.txt` 與 `pipeline-meta.json` 的追溯結構。
4. 先註冊第一個男性凡人主角素材，作為後續角色、NPC、怪物與物品素材的標準範例。
5. 先建立 registry 與資料契約，不在第一階段重做地圖、戰鬥或圖鑑渲染。

## 非目標

- 不一次替換所有地圖 token。
- 不一次生成所有物品、怪物、NPC 與技能效果。
- 不導入外部 CDN 或後端資產服務。
- 不把 AI prompt 寫入遊戲 runtime state。

## 資料夾規範

```text
public/assets/generated/
  characters/
    player/
    npc/
  enemies/
    mortal/
    qi-refining/
    foundation/
  items/
    pills/
    equipment/
    manuals/
    materials/
    quest/
    currency/
    talisman/
    array/
    artifacts/
  effects/
    skills/
    combat/
    breakthrough/
    healing/
  maps/
    villages/
    realms/
    sects/
  ui/
    icons/
    badges/
```

每個素材資料夾至少保留：

```text
raw-sheet.png
sheet-transparent.png
frames/
animation.gif
prompt-used.txt
pipeline-meta.json
asset.json
```

若素材是靜態 icon，可用 `raw.png` 與 `transparent.png` 取代 sheet，但 `asset.json` 仍需存在。

## Asset ID 規則

`assetId` 使用 dot path，格式為：

```text
<kind>.<domain>.<name>.v<version>
```

範例：

- `character.player.mortal_male.v1`
- `npc.village.chief.v1`
- `enemy.mortal.grave_zombie.v1`
- `item.pill.minor_qi.v1`
- `fx.skill.wind_sword_slash.v1`
- `map.village.immortal_origin.v1`

資料表只記錄 `assetId`，不直接寫 public path。顯示層透過 registry 解析 URL。

## AssetDefinition

`AssetDefinition` 必須描述：

- `assetId`
- `kind`
- `name`
- `description`
- `style`
- `source`
- `version`
- `usage`
- `basePath`
- `files`
- `sprite` metadata
- `tags`

第一階段不把 `assetId` 加進所有既有 domain types，避免大範圍 migration。後續每條功能線可逐步把 `assetId` 接到 `Enemy`、`NPC`、`Item`、`Skill`、`MapData`。

## 第一批素材策略

第一批只產出 `character.player.mortal_male.v1`：

- `kind`: `character`
- `usage`: `map_token`, `player_walk`
- `style`: `pixel_art`
- `sheet`: `4x4`
- `view`: `topdown`
- `anchor`: `feet`
- `rows`: down, left, right, up
- `cols`: neutral, left foot, neutral, right foot

這個素材不立即替換玩家 token，但會被 registry 測試驗證 URL 與 metadata 結構。

## 後續接入順序

1. Item icon：圖鑑與背包最容易驗證，且不影響戰鬥。
2. Enemy sprite：怪物卡與戰鬥目標先顯示，地圖 token 後接。
3. NPC token / portrait：任務與商店互動更容易辨識。
4. Player sprite：地圖角色從符號替換成 walk sheet。
5. Combat FX：技能、命中、回血、突破與雷劫。
6. Map art：最後才評估 `$generate2dmap` 與 playable collision / zone metadata。

## 驗證

- Registry 必須能解析已註冊 asset。
- 未知 `assetId` 必須 fallback。
- 第一個角色素材必須有 `asset.json` 與 prompt / meta 檔。
- TypeScript、build 與 targeted tests 必須通過。
