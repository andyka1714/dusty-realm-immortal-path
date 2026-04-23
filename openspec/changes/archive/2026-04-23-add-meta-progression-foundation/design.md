## Context

目前專案的 battle core 與高境界內容已達到下一輪擴張可用的穩定度，但 persistence 與 meta progression 還停留在舊架構：

1. `store/localStorage.ts` 仍使用單一 `dusty-realm-save-v1` key，直接存整個 current run root state
2. `store/persistedStateMigration.ts` 目前只處理技能書與背包遷移，沒有 schema version 與 soul/current 分層
3. `Dashboard` 的死亡畫面仍只有一顆 `重入輪迴` 按鈕，直接 dispatch `reincarnate()` 回到未初始化狀態
4. `openspec/specs/game-mechanics/spec.md` 與 `client-*` specs 仍沒有反映目前已落地的 world combat 與 full-screen flow

這代表現在需要的不是再補局部 feature，而是先建立一條能承接下一輪系統的 foundation。

## Goals

- 建立 `Soul Save` 與 `Current Run` 的正式分層
- 讓死亡 / 主動結束此世可以進入正式的生涯結算與輪迴配置流程
- 將 base spec 回寫到目前真實玩法，避免後續 change 建立在錯誤基線上
- 保持前端單機、LocalStorage 與離線收益架構，不引入後端依賴

## Non-Goals

- 這次不直接實作煉丹 / 煉器 / 事件系統
- 這次不直接擴寫宗門中後期內容
- 這次不直接進入像素風 full rollout
- 這次不引入雲端存檔或帳號系統

## Decisions

### 1. 新增 `soul` slice，並將存檔升級為版本化 envelope

存檔不再只是一份 raw Redux root state，而是版本化結構：

```ts
interface PersistedSaveEnvelopeV2 {
  schemaVersion: 2;
  current: {
    character: CharacterState;
    logs: LogState;
    adventure: AdventureState;
    inventory: InventoryState;
    workshop: WorkshopState;
    quest: QuestState;
  };
  soul: SoulState;
}
```

理由：

- `current` 與 `soul` 的生命週期不同，應在 schema 上直接分開
- 後續再加 `events / workshop / meta perks / pixel-art settings` 時，也比較容易做版本遷移

### 2. 輪迴流程改成兩階段，而不是立即 reset

這次 foundation 的正式流程是：

1. 本世結束：死亡或主動結束此世
2. 系統生成 `Life Review`
3. 玩家進入 `Reincarnation Hall`
4. 配置 `Perks / Heirloom / Rebirth Config`
5. 確認後才建立下一世 current run

理由：

- 這樣 `Merit`、`Lifetime Stats`、`Heirloom` 才能有完整的 UI 與資料承接
- 也避免死亡事件與新角色初始化混成同一個 reducer action

### 3. `Merit` foundation 先採用可從現有資料穩定推導的公式

第一版不直接擴到大量成就條件，而是用目前已可可靠讀取的資料：

1. 最高大境界
2. 享年

第一版 merit 來源：

- `Realm Merit`: 依最高大境界給固定基礎值
- `Age Merit`: `floor(yearsLived * 0.5)`

理由：

- 目前 repo 還沒有完整的 boss clear / encounter history / achievement telemetry
- 先用穩定欄位建立正式 loop，之後再擴成更細的 milestone bonus

### 4. `Lifetime Stats / Heirloom / Perks` 先做 foundation catalog，而不是一次灌滿內容

第一版只做能支撐系統閉環的最小正式集：

- `Lifetime Stats`
  - highestRealmEver
  - highestAgeYears
  - totalDeaths
  - totalReincarnations
- `Heirloom Vault`
  - 先只允許保留受控類型，例如裝備與技能書
  - 不允許直接帶大量可堆疊材料與突破道具，避免破壞 early-game loop
- `Perk Catalog`
  - 靈根保底 / 靈石起始 / 初始屬性偏向 / 額外 heirloom slot 等第一批穩定選項

理由：

- 這次主線的目標是建立基礎閉環，不是一次把 meta content 全寫完

### 5. Base spec 要同步回寫目前真實玩法

這條 change 不只加 reincarnation requirement，也要回寫目前已經成立的真實系統，例如：

- 地圖內時間軸戰鬥
- world combat 直接在 `Adventure` 場景裡解析
- App root 在 `Intro / Death Summary / Reincarnation Hall / GameShell` 之間切換

理由：

- 如果不一起回寫，後面每條 change 仍會建立在「舊 spec 說是回合制」這種錯誤基線上

## Risks / Trade-offs

- 若 soul/current 分層定得太模糊，之後 `事件 / 百業 / 宗門內容` 會再次混回單層存檔
  - Mitigation: 直接在 persistence schema 與 spec 上分開 current 與 soul
- 若第一版 merit / perk / heirloom 範圍過大，主線會膨脹成三條線混在一起
  - Mitigation: 第一版只做 foundation catalog 與最小正式 loop
- 若這次只補 UI，不補 migration，舊存檔一上線就會失真
  - Mitigation: 把 legacy raw save -> versioned envelope 的 migration 納入同一條 change

## Migration Plan

1. 先在 persistence 層接受兩種輸入：
   - 舊版 raw root state
   - 新版 versioned envelope
2. 將 legacy save 自動升級成 `schemaVersion: 2`，補上預設 `soul` state
3. 完成 `Reincarnation Hall` 後，再把 `reincarnate()` 由單純 reset 改成走正式 life review / rebirth config pipeline

## Open Questions

- 第一版是否要支援「主動坐化轉生」，或先只支援死亡後輪迴
- 第一版 heirloom slot 要從 1 格起步，還是直接允許 0-3 格配置
- 第一版 perk 是否需要職業導向分支，或先維持通用 perk catalog

