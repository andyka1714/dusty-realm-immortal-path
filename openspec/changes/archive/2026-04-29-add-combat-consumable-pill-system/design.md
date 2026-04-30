# Design: 戰鬥丹藥與晉階丹系統

## Context
玩家在地圖內即時戰鬥會消耗氣血與靈力。現有 `ConsumableEffect` 已支援 `heal_hp`、`heal_mp`、`full_restore`、`gain_exp`、`buff_stat`、`breakthrough_chance` 與 `lifespan`，但資料與 runtime 尚未形成完整補給 loop。大境界突破已透過 `BREAKTHROUGH_CONFIG.requiredItemId` 要求突破物，Boss drop table 也已有 `bt_*`，但缺少正式 audit 與「晉階丹 / 晉階靈物」定位。

## Goals
- 恢復丹藥共用單一 5 秒 CD，不讓回血丹與回靈丹分別繞過冷卻。
- 自動服丹只在地圖內戰鬥 runtime 生效，避免背包中一般服丹誤觸。
- 丹藥資料按境界與用途分層，商店 / 煉丹 / 掉落來源可被圖鑑追蹤。
- 每個大境界突破物都有 Boss 掉落驗證，突破流程仍沿用現有 Dashboard gating。

## Non-Goals
- 不新增藥效疊層 buff runtime；既有 `buff_stat` 仍走現有一般 consumable 流程。
- 不新增複雜藥品 hotbar 或多格預設配置。
- 不把 CD timestamp 寫入存檔。

## Technical Decisions
- 新增 `RECOVERY_CONSUMABLE_COOLDOWN_MS = 5000` 與 helper，所有 `heal_hp`、`heal_mp` 都視為 recovery consumable；`full_restore` 保留為底層 effect 型別但本階段不發布正式丹藥。
- `AdventureState` 新增 `autoConsumableSettings`：
  - `hp.enabled`
  - `hp.thresholdPercent`
  - `mp.enabled`
  - `mp.thresholdPercent`
- `Adventure.tsx` 保留 runtime `lastRecoveryConsumableUsedAt`，手動與自動服丹共用同一個使用函式。
- 自動選藥順序：
  1. 如果 HP 與 MP 都低，優先使用同時帶有 `heal_hp` 與 `heal_mp` 的混合恢復丹。
  2. HP 低時選擇 `heal_hp`。
  3. MP 低時選擇 `heal_mp`。
  4. 同類型中選擇恢復量最接近缺口且不小於缺口的丹藥；若都不足，選最大恢復量。
- 晉階物 audit 以 `BREAKTHROUGH_CONFIG` 與 `BOSS_ENEMIES` 為準：每個 `requiredItemId` 必須存在，且至少一個同境界 Boss 掉落該物品。
