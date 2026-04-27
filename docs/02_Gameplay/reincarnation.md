# 輪迴轉生系統設計 (Reincarnation System Design)

## 1. 目前已落地的 foundation

`add-meta-progression-foundation` 第一批已把輪迴從「死亡後直接 reset」改成正式 meta progression 流程：

1. 存檔改為版本化 save envelope，明確拆成 `current` 與 `soul`
2. `soul` 會永久保留 `功德 / Lifetime Stats / 已解鎖魂印 / 傳承遺珍`
3. 角色死亡後不再直接回到開場，而是先進入 `本世結算 (Life Review)`
4. 玩家可在 `輪迴大殿 (Reincarnation Hall)` 配置魂印、選擇遺珍、改寫靈根
5. `Rebirth` 後只重置 current run，`soul` progression 不會被清掉

這代表「身死道消」現在已經是新一輪 build 的開始，而不是單純清檔。

## 2. 存檔模型

第一批 foundation 已將 LocalStorage 升級為版本化格式：

```typescript
interface PersistedEnvelopeV2 {
  schemaVersion: 2;
  current: {
    character: CharacterState;
    inventory: InventoryState;
    adventure: AdventureState;
    workshop: WorkshopState;
    quest: QuestState;
    logs: LogState;
  };
  soul: SoulState;
}
```

### `current`

- 當世角色
- 背包
- 任務
- 洞府 / 百業當世進度
- 探索 / 冒險狀態
- 當世 log

### `soul`

- `totalMerit`
- `lifetimeStats`
  - `highestRealmEver`
  - `highestAgeYears`
  - `totalDeaths`
  - `totalReincarnations`
- `unlockedPerkIds`
- `heirloomVault`
- `pendingLifeReview`
- `rebirthConfig`

此外，legacy raw save 也已經有 migration，舊存檔讀入時會自動補出新的 `soul` 結構。

## 3. 本世結算 (Life Review)

死亡時，系統會根據本世成就換算成功德值。

### A. 境界功德 (Realm Merit)

| 境界 (Major Realm) | 基礎功德值 |
| :--- | :--- |
| 凡人 | 0 |
| 練氣 | 10 |
| 築基 | 50 |
| 金丹 | 200 |
| 元嬰 | 1,000 |
| 化神 | 5,000 |
| 煉虛 | 20,000 |
| 合體 | 100,000 |
| 大乘 | 500,000 |
| 渡劫 | 2,000,000 |
| 仙人 | 10,000,000 |
| 仙帝 | 100,000,000 |

### B. 壽元功德 (Age Merit)

- 公式：`活過的年數 × 0.5`，向下取整

### 範例

- 金丹期隕落：`200`
- 享年 350 歲：`175`
- 本世新增功德：`375`

## 4. 目前正式支援的輪迴配置

目前正式輪迴 planner 已升級到 v2，正式支援以下配置：

### A. Build Identity / Planner v2

- `rebirthConfig` 現在固定帶有：
  - `plannerVersion`
  - `selectedBuildIdentity`
  - `selectedSealId`
  - `selectedPerkIds`
  - `selectedHeirloomIds`
  - `spiritRootOverride`
- `selectedBuildIdentity` 目前有四種：
  - `均衡開局`
  - `劍修轉世`
  - `體修轉世`
  - `法修轉世`
- 非 `均衡開局` 時，輪迴 Hall 會明確限制不相符的職業武器 / 手札遺珍，並阻擋互斥魂印。
- 舊存檔進入 v2 時，migration 會自動補 `plannerVersion = 2`，並清掉不合法的流派、魂印、遺珍與 cost 組合。

### B. 魂印 (Perks)

- `先天根骨`：下一世根骨 `+2`，花費 `25` 功德
- `靈慧早開`：下一世悟性 `+2`，花費 `25` 功德
- `前世餘澤`：下一世初始靈石 `+150`，花費 `40` 功德
- `武魄先成`：下一世體魄 `+2`，於至少抵達 `金丹` 後開放，花費 `25` 功德
- `前塵寶匣`：下一世可額外攜帶 `1` 件遺珍，於至少抵達 `元嬰` 後開放，花費 `80` 功德
- `劍骨先鳴 / 戰軀先成 / 玄識早醒`：第二批 build-lane 專屬魂印，只能在對應流派下選取
- `劍鞘殘響 / 血鼓殘響 / 星燈殘響`：需讀取 `soul.worldMemoryTags` 的 route memory 才能解鎖的輪迴魂印

### C. 本命魂印 (Soul Seals)

- `劍脈轉世`
- `戰軀轉世`
- `玄燈轉世`
- `仙誓劍胎`
- `不滅血印`
- `仙宮星命`

本命魂印會額外提供：

- 更強的下一世 build identity cue
- 一組固定 stat / 起手資源 bonus
- 更明確的遺珍限制說明

前三個 v2 route-memory 魂印目前都需要：

- 至少曾抵達 `金丹`
- 對應的 route / world memory 已被寫入 `soul.worldMemoryTags`

v3 route memory 進一步追加三個仙人期本命魂印：

- `seal_sword_immortal_oath / 仙誓劍胎`：需要 `sect:sword:world-chapter-03`，承接凌霄劍宗仙誓，提供劍修高階開局 cue 與根骨 / 悟性收益。
- `seal_body_immortal_blood / 不滅血印`：需要 `sect:beast:world-chapter-03`，承接萬獸山莊帝血戰意，提供體修高階開局 cue 與體魄 / 福緣收益。
- `seal_mage_immortal_star / 仙宮星命`：需要 `sect:mystic:world-chapter-03`，承接縹緲仙宮星命，提供法修高階開局 cue、神識 / 悟性收益與初始靈石。

輪迴 Hall 會在可用與鎖定的本命魂印卡片上顯示：

- machine-readable route memory source，例如 `sect:sword:world-chapter-03`
- 下一世 build identity cue
- 預期收益
- 鎖定時缺少哪個 `sect:*:world-chapter-03` world memory

這批 v3 hook 只讀既有 `soul.worldMemoryTags` 與既有 `rebirthConfig.selectedSealId`。它不新增 `soul`、`current` 或 LocalStorage envelope 欄位，因此不需要 migration 或 hydrate sanitize。

### D. 靈根改寫

- 可在輪迴大殿指定下一世靈根
- 第一批 cost 固定為 `100` 功德
- 若不指定，則承接前世靈根作為 rebirth baseline

### E. 遺珍繼承

- 基礎可攜 `1` 格
- 若選擇 `前塵寶匣`，可擴成 `2` 格
- 可攜物類型：
  - 有 instance 的裝備
  - 技能書 / 功法手札
- v2 新增流派限制：
  - `均衡開局` 不限制職業向遺珍
  - `劍修轉世 / 體修轉世 / 法修轉世` 會自動排除不相符的職業武器與手札
  - 通用防具 / 飾品仍可帶入

## 5. 目前正式 UI 流程

### 角色死亡後 / 主動坐化

1. `Dashboard` 偵測 `isDead`
2. 若 `soul.flowStep === inactive`，自動建立 `Life Review`
3. 玩家也可在存活時透過 `主動坐化` 入口，直接以 `voluntary` cause 建立同一條 `Life Review`
4. 顯示 `本世結算`
5. 玩家按下 `進入輪迴大殿`
6. 顯示 `輪迴大殿`
7. 玩家配置 build identity / 本命魂印 / 魂印 / 靈根 / 遺珍
8. 按下 `投胎轉世`
9. 重建新一世角色，保留 `soul progression`

### 重生後會被重置的內容

- 角色境界與修為
- 當世背包
- 當世任務
- 冒險地圖狀態
- 洞府 / 百業當世進度
- 當世 log

### 重生後會保留的內容

- `totalMerit`
- `lifetimeStats`
- `worldMemoryTags`
- 已解鎖魂印
- 已選中的遺珍（以新 instance 重建）

## 6. 目前尚未在第一批開放的內容

以下仍屬後續批次，而不是目前已完成內容：

- 輪迴 build identity 直接影響 NPC / 劇情 / 世界反應
- 更高上限的多格遺珍繼承與更深的 heirloom quality rule
- 財富繼承百分比
- 輪迴次數影響 NPC / 劇情 / 世界事件

## 7. 後續方向

下一批應優先補的，不是再重做 `soul` 結構，而是把 v2 planner 接進更大的 meta loop：

1. 把更多 `Workshop / 百業 / 事件奇遇` 收益接進多周目長線
2. 擴張職業專屬或路線專屬的 reincarnation perk / seal / heirloom planner
3. 讓輪迴次數開始影響世界、宗門與 route-specific 內容
