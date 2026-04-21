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

## 4. 第一批已開放的輪迴配置

目前第一批 foundation 已正式支援以下配置：

### A. 魂印 (Perks)

- `先天根骨`：下一世根骨 `+2`，花費 `25` 功德
- `靈慧早開`：下一世悟性 `+2`，花費 `25` 功德
- `前世餘澤`：下一世初始靈石 `+150`，花費 `40` 功德

### B. 靈根改寫

- 可在輪迴大殿指定下一世靈根
- 第一批 cost 固定為 `100` 功德
- 若不指定，則承接前世靈根作為 rebirth baseline

### C. 遺珍繼承

- 第一批只開 `1` 格
- 可攜物類型：
  - 有 instance 的裝備
  - 技能書 / 功法手札

## 5. 目前正式 UI 流程

### 角色死亡後

1. `Dashboard` 偵測 `isDead`
2. 若 `soul.flowStep === inactive`，自動建立 `Life Review`
3. 顯示 `本世結算`
4. 玩家按下 `進入輪迴大殿`
5. 顯示 `輪迴大殿`
6. 玩家配置魂印 / 靈根 / 遺珍
7. 按下 `投胎轉世`
8. 重建新一世角色，保留 `soul progression`

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
- 已解鎖魂印
- 已選中的遺珍（以新 instance 重建）

## 6. 目前尚未在第一批開放的內容

以下仍屬後續批次，而不是這一批 foundation 已完成內容：

- 主動坐化 / 非死亡型輪迴入口
- 更大的魂印 catalog
- 職業專屬輪迴分支
- 多格遺珍繼承
- 財富繼承百分比
- 輪迴次數影響 NPC / 劇情 / 世界事件

## 7. 後續方向

下一批應優先補的，不是再重做 `soul` 結構，而是建立真正的 meta loop：

1. 把 `Reincarnation Hall` 從 foundation UI 擴成正式 build planner
2. 把 `Workshop / 百業 / 事件奇遇` 接進多周目長線收益
3. 回寫正式 base specs，讓目前 live combat 與 reincarnation truth 成為 spec baseline
